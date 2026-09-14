import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

function cleanValue(val: any): any {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.endsWith('rem')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 16) : 16;
    }
    if (trimmed.endsWith('px')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? num : 16;
    }
    if (trimmed.endsWith('em')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 16) : 16;
    }
    if (trimmed.endsWith('pt')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 1.33) : 16;
    }
    const parsed = parseFloat(trimmed);
    if (!isNaN(parsed)) {
      return parsed;
    }
    return 16;
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
    if (cleaned.fontFamily && typeof cleaned.fontFamily === 'string') {
      const family = cleaned.fontFamily;
      if (
        family.includes('Montserrat') ||
        family.includes('Ageo') ||
        family.includes('-Bold') ||
        family.includes('-Medium') ||
        family.includes('-SemiBold') ||
        family.includes('-Regular')
      ) {
        delete cleaned.fontWeight;
      }
    }
    return cleaned;
  }
  return style;
}

const originalCreateElement = React.createElement;
(React as any).createElement = function (type: any, props: any, ...children: any[]) {
  if (props && props.style) {
    props = {
      ...props,
      style: sanitizeStyleObject(props.style),
    };
  }
  return originalCreateElement.call(React, type, props, ...children);
};

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
