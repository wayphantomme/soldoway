import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, partnerWallet } = body;

    if (!campaignId || !partnerWallet) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Simulate Google Calendar API Verification
    // Here we would normally query the Google Calendar API using an OAuth token
    // to confirm that the meeting took place and was attended by the prospect.
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulated delay

    // 2. Database State Update
    // In a full implementation, we'd mark the meeting as VALIDATED in Prisma
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Calculate payout amount (simulated relayer logic)
    // The smart contract uses bps (percentageFee * 100)
    const payoutAmount = campaign.totalDeposit * ((campaign.percentageFee || 0) / 100);

    // Normally we would update the meeting status:
    // await prisma.meeting.update({
    //   where: { id: meetingId },
    //   data: { status: 'VALIDATED' }
    // });

    return NextResponse.json({
      success: true,
      message: 'Meeting verified via Mock Google Calendar API',
      payoutAmount,
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
