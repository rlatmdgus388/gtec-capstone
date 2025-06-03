import 'package:flutter/material.dart';

class FlutterFlowIconButton extends StatelessWidget {
  const FlutterFlowIconButton({
    Key? key,
    required this.icon,
    required this.onPressed,
    this.borderColor = Colors.transparent,
    this.borderRadius = 8.0,
    this.borderWidth = 1.0,
    this.buttonSize = 40.0,
    this.fillColor,
    this.disabledColor,
    this.disabledIconColor,
    this.hoverColor,
    this.hoverIconColor,
    this.splashColor,
    this.iconColor,
    this.iconSize,
    this.padding = EdgeInsets.zero,
    this.showLoadingIndicator = false,
  }) : super(key: key);

  final Widget icon;
  final Function() onPressed;
  final Color borderColor;
  final double borderRadius;
  final double borderWidth;
  final double buttonSize;
  final Color? fillColor;
  final Color? disabledColor;
  final Color? disabledIconColor;
  final Color? hoverColor;
  final Color? hoverIconColor;
  final Color? splashColor;
  final Color? iconColor;
  final double? iconSize;
  final EdgeInsetsGeometry padding;
  final bool showLoadingIndicator;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      width: buttonSize,
      height: buttonSize,
      child: RawMaterialButton(
        onPressed: onPressed,
        fillColor: fillColor,
        splashColor: splashColor,
        hoverColor: hoverColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius),
          side: BorderSide(
            color: borderColor,
            width: borderWidth,
          ),
        ),
        child: Padding(
          padding: padding,
          child: showLoadingIndicator
              ? SizedBox(
                  width: iconSize ?? 24,
                  height: iconSize ?? 24,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      iconColor ?? theme.primaryColor,
                    ),
                  ),
                )
              : IconTheme(
                  data: IconThemeData(
                    color: iconColor,
                    size: iconSize,
                  ),
                  child: icon,
                ),
        ),
      ),
    );
  }
}
