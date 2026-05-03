import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerWallet = searchParams.get('ownerWallet');

  try {
    if (ownerWallet) {
      const campaigns = await prisma.campaign.findMany({
        where: { ownerWallet },
        include: { meetings: true, yieldLogs: { orderBy: { loggedAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: campaigns });
    }
    
    // Default fetch all (for prototype purposes)
    const campaigns = await prisma.campaign.findMany({
      include: { meetings: true, yieldLogs: { orderBy: { loggedAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignPda, ownerWallet, title, companyName, category, description, percentageFee, totalDeposit } = body;

    if (!campaignPda || !ownerWallet || !title || totalDeposit === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        campaignPda,
        ownerWallet,
        title,
        companyName,
        category,
        description,
        percentageFee,
        totalDeposit,
        currentYield: 0,
      },
    });

    // Insert 7 days of dummy historical yield data for the graph
    const dummyYields = [
      { campaignId: campaign.id, yieldAmount: 0.001, loggedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.0025, loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.004, loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.0052, loggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.008, loggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.011, loggedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { campaignId: campaign.id, yieldAmount: 0.015, loggedAt: new Date() },
    ];
    await prisma.yieldLog.createMany({ data: dummyYields });

    // Update currentYield to reflect the latest
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { currentYield: 0.015 },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
