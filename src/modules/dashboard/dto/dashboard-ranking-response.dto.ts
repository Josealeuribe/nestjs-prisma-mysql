export class DashboardRankingItemDto {
  label: string;
  total: number;
}

export class DashboardRankingResponseDto {
  periodo: string;
  items: DashboardRankingItemDto[];
}