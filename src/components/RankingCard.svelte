
<script>
  import { yen } from '../lib/ranking.js';

  let { group } = $props();
</script>

<section class="ranking-section">
  <div class="section-heading">
    <h2>{group.sector}</h2>
    <span class="count">TOP {group.rows.length}</span>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>順位・企業名</th>
          <th class="numeric">平均年間給与</th>
          <th class="numeric">従業員数</th>
        </tr>
      </thead>

      <tbody>
        {#each group.rows as company, index (`${company.edinetCode ?? company.ticker ?? company.name}-${index}`)}
          <tr>
            <td>
              <span class="rank-number">{index + 1}.</span>
              <strong>{company.name}</strong>
              <span class="ticker">{company.ticker}</span>

              <div class="bar-track">
                <div
                  class="bar"
                  style:width={`${group.scale(company.salary)}%`}
                ></div>
              </div>
            </td>

            <td class="numeric salary">
              {yen(company.salary)}
            </td>

            <td class="numeric">
              {yen(company.employees)}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="3" class="empty">該当企業なし</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .ranking-section {
    background: white;
    border: 1px solid #dce5ed;
    border-radius: 10px;
    overflow: hidden;
    min-width: 0;
  }

  .section-heading {
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  h2 {
    margin: 0;
    font-size: 18px;
  }

  .count {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  .table-scroll {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 11px;
  }

  th {
    background: #edf2f7;
    color: #475569;
    font-size: 12px;
    text-align: left;
    padding: 10px 8px;
    white-space: nowrap;
  }

  td {
    padding: 10px 8px;
    border-bottom: 1px solid #e8edf2;
  }

  tbody tr:hover {
    background: #f7fbff;
  }

  .rank-number {
    font-weight: 800;
    font-size: 12px;
    color: #285b85;
    margin-right: 5px;
  }

  .ticker {
    display: block;
    margin-top: 5px;
    color: #94a3b8;
    font-size: 11px;
  }

  .salary {
    font-weight: 700;
  }

  .numeric {
    text-align: right;
    white-space: nowrap;
  }

  .bar-track {
    background: #e8f0f6;
    height: 5px;
    margin-top: 7px;
    border-radius: 3px;
  }

  .bar {
    height: 100%;
    background: #3c82b3;
    border-radius: 3px;
  }

  .empty {
    text-align: center;
    padding: 35px;
    color: #64748b;
  }
</style>
