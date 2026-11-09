
import { scaleLinear } from 'd3';

export function createRankings(companies, employeeCondition, rankingOrder = 'top') {
  const sectors = [
    '全産業',
    ...new Set(companies.map(d => d.sector).filter(Boolean))
  ];

  return sectors.map(sector => {
    const rows = companies
      .filter(d => sector === '全産業' || d.sector === sector)
      .filter(d => employeeCondition === '制限なし' || d.employees >= parseInt(employeeCondition, 10))
      .filter(d => Number.isFinite(d.salary) && d.salary > 0)
      .sort((a, b) =>
        (rankingOrder === 'bottom' ? a.salary - b.salary : b.salary - a.salary)
        || a.name.localeCompare(b.name, 'ja')
      )
      .slice(0, 30);

    return {
      sector,
      rows,
      scale: scaleLinear()
        .domain([0, Math.max(1, ...rows.map(d => d.salary))])
        .range([0, 100])
    };
  });
}

export function yen(value) {
  return Math.round(value).toLocaleString('ja-JP');
}
