import { NextRequest, NextResponse } from "next/server";
import { MOCK_TENDERS } from "@/mocks/tenders";
import { Tender } from "@/types/tender";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shouldFail = searchParams.get("fail") === "1";

  const delay = Math.floor(Math.random() * 300) + 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Terjadi kesalahan pada server saat memuat data tender (Simulasi)",
        },
      },
      { status: 500 }
    );
  }

  const mockFailuresEnabled = process.env.NEXT_PUBLIC_MOCK_FAILURES === "true";
  if (mockFailuresEnabled && Math.random() < 0.1) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Layanan pipeline ekstraksi sedang sibuk, silakan coba sesaat lagi.",
        },
      },
      { status: 503 }
    );
  }

  const tenders: Tender[] = MOCK_TENDERS.map((item) => ({
    id: item.id,
    code: item.code,
    title: item.title,
    agency: item.agency,
    status: item.status,
    updatedAt: item.updatedAt,
  }));

  return NextResponse.json({ data: tenders });
}

