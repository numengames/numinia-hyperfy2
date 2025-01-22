export const Display = {}
export const FlexDirection = {}
export const JustifyContent = {}
export const AlignItems = {}
export const AlignContent = {}
export const FlexWrap = {}

// setup globals after Yoga wasm loaded
export const initYoga = () => {
  Display['flex'] = Yoga.DISPLAY_FLEX
  Display['none'] = Yoga.DISPLAY_NONE
  FlexDirection['column'] = Yoga.FLEX_DIRECTION_COLUMN
  FlexDirection['column-reverse'] = Yoga.FLEX_DIRECTION_COLUMN_REVERSE
  FlexDirection['row'] = Yoga.FLEX_DIRECTION_ROW
  FlexDirection['row-reverse'] = Yoga.FLEX_DIRECTION_ROW_REVERSE
  JustifyContent['flex-start'] = Yoga.JUSTIFY_FLEX_START
  JustifyContent['flex-end'] = Yoga.JUSTIFY_FLEX_END
  JustifyContent['center'] = Yoga.JUSTIFY_CENTER
  AlignItems['stretch'] = Yoga.ALIGN_STRETCH
  AlignItems['flex-start'] = Yoga.ALIGN_FLEX_START
  AlignItems['flex-end'] = Yoga.ALIGN_FLEX_END
  AlignItems['center'] = Yoga.ALIGN_CENTER
  AlignItems['baseline'] = Yoga.ALIGN_BASELINE
  AlignContent['flex-start'] = Yoga.ALIGN_FLEX_START
  AlignContent['flex-end'] = Yoga.ALIGN_FLEX_END
  AlignContent['stretch'] = Yoga.ALIGN_STRETCH
  AlignContent['center'] = Yoga.ALIGN_CENTER
  AlignContent['space-between'] = Yoga.ALIGN_SPACE_BETWEEN
  AlignContent['space-around'] = Yoga.ALIGN_SPACE_AROUND
  AlignContent['space-evenly'] = Yoga.ALIGN_SPACE_EVENLY
  FlexWrap['no-wrap'] = Yoga.WRAP_NO_WRAP
  FlexWrap['wrap'] = Yoga.WRAP_WRAP
  FlexWrap['wrap-reverse'] = Yoga.WRAP_WRAP_REVERSE
}
