# UIView

Represents a single view inside a UI, similar to a `div`.

```jsx
const view = app.create('uiview')
view.backgroundColor = 'rgba(0, 0, 0, 0.5)'
```

### `uiview.display`: String

Either `none` or `flex`. 
Defaults to `flex`.

### `uiview.width`: Number

The width of the view in pixels. Defaults to `100`.

### `uiview.height`: Number

The height of the view in pixels. Defaults to `100`.

### `uiview.backgroundColor`: String

The background color of the view. 
Can be hex (eg `#000000`) or rgba (eg `rgba(0, 0, 0, 0.5)`).
Defaults to `null`.

### `uiview.borderRadius`: Number

The radius of the border in pixels.

### `uiview.margin`: Number

The outer margin of the view in pixels.
Defaults to `0`.

### `uiview.padding`: Number

The inner padding of the view in pixels.
Defaults to `0`.

### `uiview.flexDirection`: String

The flex direction. `column`, `column-reverse`, `row` or `row-reverse`.
Defaults to `column`.

### `uiview.justifyContent`: String

Options: `flex-start`, `flex-end`, `center`.
Defaults to `flex-start`.

### `uiview.alignItems`: String

Options: `stretch`, `flex-start`, `flex-end`, `center`, `baseline`.
Defaults to `stretch`.

### `uiview.alignContent`: String

Options: `flex-start`, `flex-end`, `stretch`, `center`, `space-between`, `space-around`, `space-evenly`.
Defaults to `flex-start`.

### `uiview.flexBasis`: Number

Defaults to `null`.

### `uiview.flexGrow`: Number

Defaults to `null`.

### `uiview.flexShrink`: Number

Defaults to `null`.

### `uiview.flexWrap`: String

Options: `no-wrap`, `wrap`.
Defaults to `no-wrap`.

### `uiview.gap`: Number

Defaults to `0`.

### `uiview.{...Node}`

Inherits all [Node](/docs/ref/Node.md) properties

