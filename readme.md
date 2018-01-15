# html mail用pug, stylus テンプレート

## 全体の構成

css(stylus)とhtml(pug)を分離した状態で管理し、なおかつhtmlを生成する際に自動でこれを１つのhtmlに直す。
インライン用のcssはgulp-inline-cssにより自動でインラインに埋め込まれる。

```
gulp
```
通常ビルドおよびwebserver起動

```
gulp build
```
通常ビルド

```
gulp minify
```
圧縮ビルド

### assets/data

プロジェクト全体の設定をする「config.json」を設定する。  
プロジェクト共通の情報を収納する**base**、色情報を収納する**col**、テンプレートごとの情報を収納する**pages**など。  
そのほかに独自のキーを設定することも可能。

### assets/module

テンプレート共通モジュールを置く。  
`pug/`はレイアウト用の「**\_layout.pug**」、ヘッダ部の「**\_header.pug**」など。  
`styl/`はインライン用共通stylusの「**\_inline.styl**」、およびインサート用共通stylusの「**\_insert.styl**」。

### assets/template

各メールごとのpug、stylus、jsonをディレクトリで分けて置く。

## 独自の接頭辞、およびpugミックスイン

### JSONによる色の参照

`/assets/data/config.json`

```
  "col": {
    "black": "#000000",
    "white": "#ffffff",
    "info_bg": "#f0f0f0",
    "gray_darker": "#333333",
    "gray": "#666666",
    "gray_light": "#999999",
    "gray_lighter": "#eeeeee",
    "link": "#5588ee",
    "link_visited": "#3366cc",
    "link_active": "#3366cc",
    "danger": "#d23933"
  }
```

**col**キー以下にプロジェクトに使用する色を指定

####　stylusからの参照

```
body
  color col-link
```

「col- **キー** 」の形で指定する

####　pugからの指定

```
body( bgcolor = col.link )
```

「col. **キー** 」の形で指定する

### タグ属性付与用接頭辞「-」（アンダースコア）

多用されるタグ属性をクラス名でタグに付与できる。これらのクラス名はタグ属性として反映されたのち、クラス名はビルド時に除去される。

| グループ | クラス名 | 適用される属性 |
|:-|:-|:-|
| align | \_left | align="left" |
|| \_center | align="center" |
|| \_right | align="right" |
| valign | \_top | align="top" |
|| \_middle | align="middle" |
|| \_bottom | align="bottom" |
| rowspan | \_row2 | rowspan="2" |
| colspan | \_col2 | colspan="2" |
| width | \_w10 | width="10" |
|| \_w10p | width="10%" |
| height | \_h10 | height="10" |
|| \_h10p | height="10%" |
| border | \_bd2 | border="2" |
| nofollow | \_nofollow | rel="nofollow" |
| \_blank | \_blank | target="\_blank" |

### ビルド時消去用接頭辞「-」（ハイフン）

インラインcssを適用するためのクラス名にこれをつけることで、ビルド時に除去されるようになる。

### pugミックスイン

#### `+mso`、`+table`

`+mso`は条件付きコメントに挟まれたtableを提供する。`+table`は属性初期化を含んだtableタグを提供する。

```
	+mso
		+table._w100p
```

```
	<!--[if (mso)|(IE)]><table width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
		<table width="100%" border-spacing="0" border="0" cellpadding="0" cellspacing="0">
		</table>
	<!--[if (mso)|(IE)]></td></tr></table><![endif]-->
```

#### `+grid(height,arr)`

tableの幅を初期行で決め打ちするためのtr>tdタグを提供する。

```
	+grid( 12, [ '2%', '2%', '43%', '2%', '2%', '2%', '43%', '2%', '2%' ] )
```

```
    <tr height="12">
      <td width="2%"></td>
      <td width="2%"></td>
      <td width="43%"></td>
      <td width="2%"></td>
      <td width="2%"></td>
      <td width="2%"></td>
      <td width="43%"></td>
      <td width="2%"></td>
      <td width="2%"></td>
    </tr>
```