import 'package:flutter/material.dart';

class FFButtonOptions {
  const FFButtonOptions({
    this.width,
    this.height,
    this.color,
    this.textStyle,
    this.elevation,
    this.borderSide,
    this.borderRadius,
    this.padding,
    this.iconPadding,
    this.iconAlignment,
  });

  final double? width;
  final double? height;
  final Color? color;
  final TextStyle? textStyle;
  final double? elevation;
  final BorderSide? borderSide;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? iconPadding;
  final FFIconAlignment? iconAlignment;
}

enum FFIconAlignment {
  start,
  end,
}

class FFButtonWidget extends StatelessWidget {
  const FFButtonWidget({
    Key? key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.iconData,
    required this.options,
    this.showLoadingIndicator = false,
  }) : super(key: key);

  final String text;
  final Widget? icon;
  final IconData? iconData;
  final Function()? onPressed;
  final FFButtonOptions options;
  final bool showLoadingIndicator;

  @override
  Widget build(BuildContext context) {
    final textWidget = Text(
      text,
      style: options.textStyle,
      maxLines: 1,
    );
    
    Widget? leadingIcon;
    if (icon != null) {
      leadingIcon = icon;
    } else if (iconData != null) {
      leadingIcon = Icon(
        iconData,
        size: options.textStyle?.fontSize,
        color: options.textStyle?.color,
      );
    }

    return Container(
      width: options.width,
      height: options.height,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: options.color,
          elevation: options.elevation ?? 2,
          padding: options.padding,
          shape: RoundedRectangleBorder(
            borderRadius: options.borderRadius ?? BorderRadius.circular(8),
            side: options.borderSide ?? BorderSide.none,
          ),
        ),
        onPressed: onPressed,
        child: showLoadingIndicator
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : leadingIcon != null
                ? Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (options.iconAlignment == FFIconAlignment.start) leadingIcon,
                      Padding(
                        padding: options.iconPadding ?? EdgeInsets.zero,
                        child: textWidget,
                      ),
                      if (options.iconAlignment != FFIconAlignment.start) leadingIcon,
                    ],
                  )
                : textWidget,
      ),
    );
  }
}
