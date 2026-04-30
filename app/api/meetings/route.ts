import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  const partnerWallet = searchParams.get('partnerWallet');

  try {
    const whereClause: any = {};
    if (campaignId) whereClause.campaignId = campaignId;
    if (partnerWallet) whereClause.partnerWallet = partnerWallet;

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { campaign: true },
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error: any) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, partnerWallet } = body;

    if (!campaignId || !partnerWallet) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        campaignId,
        partnerWallet,
      },
    });

    return NextResponse.json({ success: true, data: meeting });
  } catch (error: any) {
    console.error('Error creating meeting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
