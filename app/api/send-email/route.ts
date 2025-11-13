import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { JournalEntry } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { email, entries, cloneName, destination, isPremium } = await request.json();

    if (!email || !entries || entries.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Free tier: limit to 1 entry, Premium: unlimited
    if (!isPremium && entries.length > 1) {
      return NextResponse.json(
        { error: 'Free tier limited to 1 journal entry. Upgrade to premium for unlimited emails.' },
        { status: 403 }
      );
    }

    const apiKey = process.env.SENDGRID_API_KEY;

    // If no SendGrid key, log to console (fallback for development)
    if (!apiKey) {
      console.log('📧 Email would be sent to:', email);
      console.log('Journal entries:', entries);
      return NextResponse.json({
        message: 'Email logged to console (SendGrid not configured)',
        success: true
      });
    }

    sgMail.setApiKey(apiKey);

    // Calculate totals
    const totalSpend = entries.reduce((sum: number, entry: JournalEntry) => sum + entry.cost, 0);
    const entryCount = entries.length;

    // Build email HTML
    const emailHtml = buildEmailHtml(cloneName, destination, entries, totalSpend, entryCount);

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@clonewander.app',
      subject: `${cloneName}'s Journey to ${destination} - CloneWander`,
      html: emailHtml,
    };

    await sgMail.send(msg);

    return NextResponse.json({
      message: 'Email sent successfully!',
      success: true,
      entriesSent: entryCount
    });

  } catch (error: any) {
    console.error('SendGrid error:', error);
    console.error('Error details:', error.response?.body || error);

    return NextResponse.json({
      error: error.message || 'Failed to send email',
      details: error.response?.body?.errors?.[0]?.message || 'Unknown error',
      success: false
    }, { status: 500 });
  }
}

function buildEmailHtml(
  cloneName: string,
  destination: string,
  entries: JournalEntry[],
  totalSpend: number,
  entryCount: number
): string {
  const entriesHtml = entries
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(entry => {
      const date = new Date(entry.timestamp).toLocaleString();
      return `
        <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-left: 4px solid #9333ea; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 12px; color: #6b7280; text-transform: capitalize;">${entry.moment}</span>
            <span style="font-size: 12px; color: #6b7280;">${date}</span>
          </div>
          <p style="color: #1f2937; line-height: 1.6; margin: 8px 0;">${entry.message}</p>
          ${entry.cost > 0 ? `<div style="margin-top: 8px;"><span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">€${entry.cost.toFixed(2)}</span></div>` : ''}
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${cloneName}'s Journey</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(to right, #3b82f6, #9333ea); padding: 32px 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🌍 CloneWander</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${cloneName}'s Journey to ${destination}</p>
        </div>

        <!-- Summary -->
        <div style="padding: 24px; background: #eff6ff; border-bottom: 1px solid #dbeafe;">
          <h2 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px;">Journey Summary</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Destination</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${destination}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Journal Entries</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${entryCount}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Total Spend</div>
              <div style="font-size: 16px; font-weight: 600; color: #059669;">€${totalSpend.toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Clone</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${cloneName}</div>
            </div>
          </div>
        </div>

        <!-- Journal Entries -->
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #374151; font-size: 18px;">📝 Journal Entries</h2>
          ${entriesHtml}
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
            Experience your own parallel life adventures
          </p>
          <a href="https://clonewander.app" style="display: inline-block; background: linear-gradient(to right, #3b82f6, #9333ea); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
            Start Your CloneWander Journey
          </a>
          <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
            CloneWander - Send AI clones on adventures while you stay home
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
