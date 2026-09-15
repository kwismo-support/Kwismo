import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

function cleanValue(val: any): any {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.endsWith('%') || trimmed === 'auto') {
      return trimmed;
    }
    if (trimmed.endsWith('rem')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 16) : val;
    }
    if (trimmed.endsWith('px')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? num : val;
    }
    if (trimmed.endsWith('em')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 16) : val;
    }
    if (trimmed.endsWith('pt')) {
      const num = parseFloat(trimmed);
      return !isNaN(num) ? Math.round(num * 1.33) : val;
    }
    const parsed = parseFloat(trimmed);
    if (!isNaN(parsed) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      return parsed;
    }
    return val;
  }
  return val;
}

export function sanitizeStyleObject(style: any, isTextElement: boolean = false): any {
  if (!style && !isTextElement) return style;

  let targetStyle = style;
  if (isTextElement && style) {
    targetStyle = StyleSheet.flatten(style) || {};
  } else if (Array.isArray(targetStyle)) {
    return targetStyle.map((item) => sanitizeStyleObject(item, isTextElement));
  }

  const cleaned: any = typeof targetStyle === 'object' && targetStyle ? { ...targetStyle } : {};

  for (const key of Object.keys(cleaned)) {
    const val = cleaned[key];
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
    }
  }

  if (isTextElement || cleaned.fontFamily || cleaned.fontWeight) {
    let family = cleaned.fontFamily;
    const weight = String(cleaned.fontWeight || '');

    if (family && typeof family === 'string' && family.includes(',')) {
      family = family.split(',')[0].trim();
    }

    const isCustomFont =
      family &&
      typeof family === 'string' &&
      (family.includes('Montserrat') || family.includes('Ageo'));

    if (!isCustomFont) {
      const fontSize = typeof cleaned.fontSize === 'number' ? cleaned.fontSize : parseFloat(String(cleaned.fontSize || 0));
      const isHeadlineSize = fontSize >= 20;

      if (isHeadlineSize) {
        if (weight === '500' || weight === 'medium') {
          family = 'MontserratAlternates-Medium';
        } else if (weight === '600') {
          family = 'MontserratAlternates-SemiBold';
        } else if (weight === '400' || weight === 'regular') {
          family = 'MontserratAlternates-Regular';
        } else {
          family = 'MontserratAlternates-Bold';
        }
      } else {
        if (weight === '700' || weight === 'bold') {
          family = 'Ageo-Bold';
        } else if (weight === '600') {
          family = 'Ageo-SemiBold';
        } else if (weight === '500' || weight === 'medium') {
          family = 'Ageo-Medium';
        } else {
          family = 'Ageo-Regular';
        }
      }
    }

    delete cleaned.fontWeight;
    if (family) {
      cleaned.fontFamily = family;
    }
  }

  return cleaned;
}

const originalCreateElement = React.createElement;
(React as any).createElement = function (type: any, props: any, ...children: any[]) {
  const isText = type === Text || type === TextInput || (typeof type === 'string' && (type === 'text' || type === 'input'));
  if (isText || (props && props.style)) {
    props = {
      ...props,
      style: sanitizeStyleObject(props ? props.style : undefined, isText),
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
    if (props) {
      props = { ...props, style: sanitizeStyleObject(props.style, true) };
    }
    return origTextRender.call(this, props, ref);
  };
}

const TextInputComponent = TextInput as any;
if (TextInputComponent && TextInputComponent.render) {
  const origTextInputRender = TextInputComponent.render;
  TextInputComponent.render = function (props: any, ref: any) {
    if (props) {
      props = { ...props, style: sanitizeStyleObject(props.style, true) };
    }
    return origTextInputRender.call(this, props, ref);
  };
}



