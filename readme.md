# html mail用pug, stylus テンプレート

## 全体の構成

css(stylus)とhtml(pug)を分離した状態で管理し、なおかつhtmlを生成する際に自動でこれを１つのhtmlに直す。

インライン用のcssは具lp-inline-cssにより自動でインラインに埋め込まれる。

### assets/data

プロジェクト全体の設定をする「config.json」及び各ページのデータを保持する「ページID.json」を設定する。

「ページID.json」は各ページのpugで扱うことができる。

「config.json」のpageリストはgulpによって自動で追記される。

### assets/pug

直下に一覧表示用の「list.pug」、及び各メイルのpugファイルをおく。

moduleフォルダ内はレイアウト用のpugテンプレートなど。

### assets/stylus

インライン表記用の「inline_ページID.styl」、及びヘッダ内のstyleタグに挿入する「insert_ページID.styl」をおく。

moduleフォルダにはそれぞれの共通スタイルを記述したstylusファイルが置かれ、各ページのstylusファイルから参照される

