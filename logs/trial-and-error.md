# Trial & Error Log

## 2026-04-05

### やったこと

1. **x-auto-poster の現状確認・フロー整理**
   - drafts/（4/3, 4/4）の中身を全確認
   - src/ の全ソースコード（index.js, postOnce.js, postToX.js, fetchNews.js, postText.js, history.js, testFetch.js）を読んだ
   - 2つのフローが分断していることを発見：フローA（cron自動投稿・未稼働）とフローB（エージェント生成→手動投稿・稼働中）

2. **analyst.md 改修**
   - 必須検索キーワード4つ（Claude Code最新/AIエージェント新機能/Anthropic発表/LLM最新情報）を追加
   - 各記事に「この技術が広まると誰が困るか」仮説1行を追加
   - frontmatterにtools: Read, Write, WebSearch, WebFetchを設定
   - ai-radar/への参照を削除（読めるファイルが存在しないため）
   - WebSearchを第一ソースに変更
   - 出力をx-auto-poster/logs/analyst-YYYY-MM-DD.mdにも保存するよう変更
   - 音声メモ（voice-notes-*.md）の読み込みをステップ0として追加

3. **marketer.md 改修**
   - 「風吹けば桶屋3段展開」を全記事に必須化
   - A案＝技術・情報系、B案＝困ってる人への問いかけ＋ととのえる屋導線に統一
   - frontmatterにtools: Read, Write, WebSearch, WebFetchを設定
   - drafts/の参照範囲を直近7日分に限定

4. **pm.md / consultant.md にfrontmatter追加**
   - pm.md：name/description/toolsが欠落していたので追加
   - consultant.md：同上

5. **全エージェント棚卸し**
   - 10体のエージェント（ビジネス6＋ギター4）のname/tools/model/役割/情報源を一覧化
   - settings.json、スキル、CLAUDE.mdの内容を整理
   - 「〇〇して」と言ったら何が動くか一覧を作成
   - 不足点を洗い出し

6. **Hooks実装（settings.json）**
   - Hook 1：Write/Edit後にqaレビュー通知（x-auto-poster/totonoeruya配下のみ）
   - Hook 2：月曜SessionStartでconsultant週次レビュー通知
   - Hook 3：analyst-*.md生成時にログ保存確認通知
   - 3つのシェルスクリプトを.claude/hooks/に作成

7. **ディレクトリ整備**
   - x-auto-poster/logs/ を新規作成（analyst出力ログ保存先）
   - ~/.claude/agents/stock/ を新規作成（未使用エージェント置き場）
   - guitar-doc-creator.md をstock/に移動

8. **drafts/2026-04-05.md を2回生成**
   - 1回目：4件AIニュース＋2件地元ネタ → 10案生成
   - 2回目：6件AIニュース＋3件地元ネタ → 10案生成（情報量が増えた）

9. **CLAUDE.mdに音声メモのDispatch用記法を追記**

### 失敗したこと・詰まったこと

1. **pmエージェントが直接起動できなかった**
   - `Agent(subagent_type="pm")` で呼び出したら「pm not found」エラー
   - agents/にファイルがあっても、Claude Codeのsubagent_typeとしては認識されない
   - general-purposeエージェントにpm/analyst/marketerの指示を全部渡して代替実行した
   - → agent teamsの実態として、agents/のmdファイルは「参照用の設計書」であり、自動的にsubagentとして登録されるわけではない可能性

2. **ai-radar/src/ が存在しなかった**
   - analyst.mdが「ai-radar/の最新出力を参照」と書いてあったが、src/ディレクトリが空
   - .next/（ビルド成果物）しかなく、Readで直接参照できるファイルがなかった
   - → ai-radar参照を削除し、WebSearchを第一ソースに変更

3. **posted.json が空だった**
   - x-auto-posterの自動投稿（cron）は一度も実行されていなかった
   - CLAUDE.mdの設計（AI_RADAR記事自動投稿）と実運用（エージェント生成→手動投稿）が完全に乖離
   - → 現時点では手動フローを正として整備を進めた

### 気づき・学び

1. **エージェントのfrontmatterは必須**
   - name/tools/modelがないと、Claude Code本体がエージェントを認識・起動できない
   - pm.mdとconsultant.mdにfrontmatterがなかったのは設計漏れ

2. **analystの出力がログに残らない設計は危険**
   - 「直接渡す（ファイル保存不要）」だと、後からレビューできない
   - logs/analyst-YYYY-MM-DD.mdに保存する運用に変更したのは正解

3. **ABテストの勝ちパターンが早くも見えた**
   - 4/4の結果：数字から入るA案がインプ77、問いかけB案は10〜55
   - 具体的な数字を冒頭に持ってくるとインプが伸びる傾向
   - ただしデータ3日分なので法則化には早い

4. **2つのフロー（自動投稿 vs 手動投稿）の整理が必要**
   - index.jsのcron自動投稿はAI_RADAR記事をそのまま流す設計
   - 実際はエージェントが作ったオリジナル文を手動投稿
   - postText.jsが唯一のブリッジだが使われていない
   - 将来的にはdrafts→postText.jsの半自動化が必要

5. **Hooksは「通知」止まりが現実的**
   - hookのcommandタイプではqaエージェントを直接起動できない
   - 「通知を出す→人が判断→手動で実行」が現時点の最善

6. **風吹けば桶屋3段展開は投稿の質を上げる**
   - 技術ニュース→困る人→ととのえる屋の導線が明確になった
   - B案の「問いかけ」が抽象的にならず、具体的な困りごとに落ちるようになった

### 次にやること

- [ ] drafts/2026-04-05.mdの投稿1 A案を今夜21:00に手動投稿する
- [ ] 投稿後にインプ・いいね・RTを結果欄に記入する
- [ ] 1週間分のABテストデータが溜まったらconsultantで法則化する
- [ ] pmエージェントの直接起動方法を調査する（agent teams機能の制約を確認）
- [ ] x-auto-posterのCLAUDE.mdを実運用に合わせて書き直す（自動投稿→エージェント生成フローに）
- [ ] postText.jsを使った半自動投稿フローを検討する
- [ ] Hook 1（qa自動レビュー）を`type: "prompt"`で本格化できるか調査する

---

## 2026-04-05 振り返り

### やったこと

1. **ハーネスエンジニアリングの概念を理解・整理**
   - AIに役割を与えて自律的に動かす仕組みの概念
   - ととのえる屋のサービス設計に活用できる可能性

2. **Claude Code構成の全棚卸し（エージェント10体・フロー確認）**

3. **analyst/marketerの情報リソース整理**
   - ai-radar参照を削除
   - WebSearch一本化

4. **marketerに「風吹けば桶屋」思想を追加**

5. **guitar-doc-creatorをstock/に退避**

6. **Hooksで自動通知設定（qa・consultant・analyst）**

7. **Claude Desktopインストール・Dispatch設定完了**
   - スマホ↔PC連動確認

8. **音声メモ→voice-notes→analyst自動読み込みの循環を構築**

9. **trial-and-error.md作成**

### 失敗したこと・詰まったこと

1. **pmのfrontmatterが抜けていて直接起動できなかった**

2. **consultantのfrontmatterも同様に抜けていた**

3. **ai-radar/のsrc/が存在せずanalystが空振りしていた**

4. **Dispatchに音声メモ機能はなかった**
   - スマホキーボードのマイク機能を使う方法に切り替えた

### 気づき・学び

1. **ハーネス・Hook・Dispatchは役割が全部違う**
   - ハーネス＝AIエージェントの構造設計
   - Hook＝イベント駆動の自動通知/実行
   - Dispatch＝スマホ↔PC間のタスクルーティング

2. **設計と実運用の乖離は早めに発見して修正が重要**

3. **ログを残す仕組みは早めに入れるほど資産になる**

4. **Dispatchはスマホキーボードマイクと組み合わせると音声メモとして使える**

### 次にやること

- [ ] 月曜日にconsultantを起動してABテストデータを法則化
- [ ] ハーネス（Evaluator/Playwright MCP）の導入検討
- [ ] Dispatchでの日課を習慣化
