# UIText

Represents text inside a UI.

```jsx
const text = app.create('uitext')
text.value = 'Hello world'
```

### `uitext.display`: String

Either `none` or `flex`. 
Defaults to `flex`.

### `uitext.value`: String

The text to display.

### `uiview.fontSize`: Number

The font size in pixels.
Defauls to `16`.

### `uiview.color`: Number

The font color.
Defauls to `#000000`.

### `uiview.lineHeight`: Number

The line height.
Defaults to `1.2`.

### `uiview.textAlign`: String

Options: `left`, `center`, `right`.
Defaults to `left`.

### `uiview.fontFamily`: String

Defaults to `Rubik`.

### `uiview.fontWeight`: Number

Defaults to `normal`, can also be a number like `100` or string like `bold`.

### `uitext.{...Node}`

Inherits all [Node](/docs/ref/Node.md) properties

