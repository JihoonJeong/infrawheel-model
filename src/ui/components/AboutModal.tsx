import { useState } from 'react';
import { useI18n } from '../i18n';
import { getAboutContent } from '../content/aboutContent';

export function AboutModal({ onClose }: { onClose: () => void }) {
  const { locale } = useI18n();
  const content = getAboutContent(locale);
  const [showEquation, setShowEquation] = useState(false);
  const [showSources, setShowSources] = useState(false);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="about-modal">
        <div className="about-header">
          <h2>{content.whatIs.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="about-scroll">
          <section className="about-section">
            <p className="about-body">{content.whatIs.body}</p>
          </section>

          <section className="about-section">
            <h3>{content.twoLoops.title}</h3>
            <p className="about-body">{content.twoLoops.body}</p>
          </section>

          <section className="about-section">
            <h3>{content.howToUse.title}</h3>
            <p className="about-body">{content.howToUse.body}</p>
          </section>

          <section className="about-section">
            <button
              className="about-toggle"
              onClick={() => setShowEquation(!showEquation)}
            >
              {content.equationToggle} {showEquation ? '▲' : '▼'}
            </button>
            {showEquation && (
              <pre className="about-code">{content.equation}</pre>
            )}
          </section>

          <section className="about-section">
            <button
              className="about-toggle"
              onClick={() => setShowSources(!showSources)}
            >
              {content.sourceToggle} {showSources ? '▲' : '▼'}
            </button>
            {showSources && (
              <div className="about-sources">
                <SourceTable locale={locale} />
              </div>
            )}
          </section>

          <footer className="about-footer">
            <p>{content.footer}</p>
          </footer>
        </div>
      </div>
    </>
  );
}

function SourceTable({ locale }: { locale: string }) {
  const sources =
    locale === 'ko'
      ? [
          ['S1 BW Memory', 'SK하이닉스·Samsung·Micron 분기 실적, TrendForce', '분기'],
          ['S2 Capacity Memory', 'Gartner/IDC 서버 시장 데이터', '분기'],
          ['S3 Packaging', 'TSMC·Samsung Foundry 실적 발표', '분기'],
          ['E1 Deliverable Power', 'IEA Data Centre Energy Tracker, US EIA, 한전', '반기'],
          ['E2 Lead Time', 'FERC interconnection queue, 산업 보고서', '반기'],
          ['E3 Compute Density', 'DC 사업자 PUE 공시, 랙 밀도 보고서', '반기'],
          ['I1 Algorithmic Efficiency', 'Stanford AI Index, Epoch AI', '반기'],
          ['I2 Transfer Ratio', 'Open LLM Leaderboard', '분기'],
          ['C1 Reinvestment Ratio', 'Big Tech 분기 실적 CAPEX guidance', '분기'],
          ['C2 Policy CAPEX', '각국 정부 예산안, CHIPS Act 현황', '반기'],
          ['H1 Bisection BW', 'NVIDIA·Broadcom 실적, LightCounting', '분기'],
          ['H2 Utilization', 'MLPerf Training, hyperscaler 공시', '반기'],
          ['D1 Revenue Growth', 'Synergy Research, IDC, AI 기업 실적', '분기'],
          ['D2 Gross Margin', 'OpenAI/Anthropic 추정, MSFT/GOOG 세그먼트', '분기'],
          ['SC1 Deployment Rate', '통신사 공시, GSMA Intelligence', '반기'],
          ['SC2 Per-node TOPS', 'Edge AI chip 벤치마크', '반기'],
          ['PA1 Fleet Deployment', 'IFR World Robotics, AV fleet 추적', '연간'],
          ['PA2 Unit Economics', '기업 case study, 산업 ROI 보고서', '반기'],
        ]
      : [
          ['S1 BW Memory', 'SK hynix, Samsung, Micron earnings; TrendForce', 'Quarterly'],
          ['S2 Capacity Memory', 'Gartner/IDC server market data', 'Quarterly'],
          ['S3 Packaging', 'TSMC, Samsung Foundry earnings', 'Quarterly'],
          ['E1 Deliverable Power', 'IEA Data Centre Energy Tracker, US EIA', 'Semi-annual'],
          ['E2 Lead Time', 'FERC interconnection queue, industry reports', 'Semi-annual'],
          ['E3 Compute Density', 'DC operator PUE disclosures, rack density reports', 'Semi-annual'],
          ['I1 Algorithmic Efficiency', 'Stanford AI Index, Epoch AI', 'Semi-annual'],
          ['I2 Transfer Ratio', 'Open LLM Leaderboard', 'Quarterly'],
          ['C1 Reinvestment Ratio', 'Big Tech quarterly CAPEX guidance', 'Quarterly'],
          ['C2 Policy CAPEX', 'National budgets, CHIPS Act status', 'Semi-annual'],
          ['H1 Bisection BW', 'NVIDIA, Broadcom earnings; LightCounting', 'Quarterly'],
          ['H2 Utilization', 'MLPerf Training, hyperscaler disclosures', 'Semi-annual'],
          ['D1 Revenue Growth', 'Synergy Research, IDC, AI company earnings', 'Quarterly'],
          ['D2 Gross Margin', 'OpenAI/Anthropic est., MSFT/GOOG segments', 'Quarterly'],
          ['SC1 Deployment Rate', 'Telco disclosures, GSMA Intelligence', 'Semi-annual'],
          ['SC2 Per-node TOPS', 'Edge AI chip benchmarks', 'Semi-annual'],
          ['PA1 Fleet Deployment', 'IFR World Robotics, AV fleet tracking', 'Annual'],
          ['PA2 Unit Economics', 'Company case studies, industry ROI reports', 'Semi-annual'],
        ];

  const headers = locale === 'ko' ? ['파라미터', '출처', '업데이트'] : ['Parameter', 'Source', 'Update'];

  return (
    <table className="source-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sources.map(([param, source, freq]) => (
          <tr key={param}>
            <td>{param}</td>
            <td>{source}</td>
            <td>{freq}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
