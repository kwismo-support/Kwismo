import { StyleSheet, Text, TextInput } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

function cleanValue(val: any): any {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^-?\d+(\.\d+)?(px)?$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) return num;
    }
  }
  return val;
}

export function sanitizeStyleObject(style: any): any {
  if (!style) return style;
  if (Array.isArray(style)) {
    return style.map(sanitizeStyleObject);
  }
  if (typeof style === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(style)) {
      const val = style[key];
      if (
        key === 'fontSize' ||
        key === 'lineHeight' ||
        key.includes('Radius') ||
        key.startsWith('margin') ||
        key.startsWith('padding') ||
        key === 'letterSpacing' ||
        key === 'borderWidth' ||
        key === 'top' ||
        key === 'bottom' ||
        key === 'left' ||
        key === 'right'
      ) {
        cleaned[key] = cleanValue(val);
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  }
  return style;
}

const originalCreate = StyleSheet.create;
(StyleSheet as any).create = function (obj: any) {
  if (obj && typeof obj === 'object') {
    const sanitizedObj: any = {};
    for (const key of Object.keys(obj)) {
      sanitizedObj[key] = sanitizeStyleObject(obj[key]);
    }
    return originalCreate.call(StyleSheet, sanitizedObj);
  }
  return originalCreate.call(StyleSheet, obj);
};

const originalFlatten = StyleSheet.flatten;
(StyleSheet as any).flatten = function (style: any) {
  const flattened = originalFlatten.call(StyleSheet, style);
  return sanitizeStyleObject(flattened);
};

if (NativeWindStyleSheet && NativeWindStyleSheet.create) {
  const origNwCreate = NativeWindStyleSheet.create;
  NativeWindStyleSheet.create = function (options: any) {
    if (options && options.styles) {
      const cleanStyles: any = {};
      for (const k of Object.keys(options.styles)) {
        cleanStyles[k] = sanitizeStyleObject(options.styles[k]);
      }
      options = { ...options, styles: cleanStyles };
    }
    return origNwCreate.call(NativeWindStyleSheet, options);
  };
}

const TextComponent = Text as any;
if (TextComponent && TextComponent.render) {
  const origTextRender = TextComponent.render;
  TextComponent.render = function (props: any, ref: any) {
    if (props && props.style) {
      props = { ...props, style: sanitizeStyleObject(props.style) };
    }
    return origTextRender.call(this, props, ref);
  };
}

const TextInputComponent = TextInput as any;
if (TextInputComponent && TextInputComponent.render) {
  const origTextInputRender = TextInputComponent.render;
  TextInputComponent.render = function (props: any, ref: any) {
    if (props && props.style) {
      props = { ...props, style: sanitizeStyleObject(props.style) };
    }
    return origTextInputRender.call(this, props, ref);
  };
}
