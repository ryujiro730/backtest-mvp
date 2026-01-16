function NoticeCard() {
  return (
    <div
      className="rounded-md p-4"
      style={{
        backgroundColor: "#fff8d6", // 柔らかい黄色背景
        border: "1px solid #f6d66c", // 明るい黄色の枠
      }}
    >
      <h2 className="text-sm font-semibold" style={{ color: "#b7791f" }}>
        ⚠ ご利用上の注意
      </h2>

      <ul className="mt-2 text-xs space-y-2" style={{ color: "#7b4f0b" }}>
        <li>
          <strong>本ツールのバックテスト結果は過去データに基づくシミュレーション</strong>であり、
          将来の利益を保証するものではありません。実際の市場環境（手数料・スリッページ・流動性・取引制限など）とは異なる場合があります。
        </li>

        <li>
          <strong>1時間足以下の時間足（M1・M5・M15）では、データ量が非常に多いため</strong>
          バックテストおよび各種グラフ描画に時間がかかる場合があります。
          処理が進行中は画面を閉じずにお待ちください。
        </li>

        <li>
          本ツールでは、<strong>各エントリーが成立した時点から決済までの値動きを1本ずつ読み取り</strong>、
          損益・ドローダウン・勝率・保有時間などを逐次計算しています。
          特殊なAI推論やブラックボックス計算ではなく、誰でも検証可能な
          「値動き＋ルール条件」のみで構成されています。
        </li>

        <li>
          DELVER Backtest Engine は現在<strong>完全無料でご利用いただけます。</strong>
          将来的な有料化や制限の予定がある場合は、事前にお知らせします。
        </li>

        <li>
          不具合・改善要望・ご質問などありましたら、
          <strong>info@delvertrade.com</strong> までお気軽にご連絡ください。
        </li>
      </ul>
    </div>
  );
}

export default NoticeCard;
