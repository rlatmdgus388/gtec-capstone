import 'package:flutter/material.dart';

// 기본 FlutterFlowModel 클래스 - 제네릭 없이 정의
abstract class FlutterFlowModel {
  void initState(BuildContext context);
  void dispose();
}

// createModel 함수 정의
T createModel<T extends FlutterFlowModel>(
  BuildContext context,
  T Function() model,
) {
  final m = model();
  m.initState(context);
  return m;
}

// BuildContext 확장 - pushNamed 메서드 추가
extension NavigationExtension on BuildContext {
  Future<T?> pushNamed<T extends Object?>(String routeName, {Object? arguments}) {
    return Navigator.of(this).pushNamed(routeName, arguments: arguments);
  }
  
  void pop<T extends Object?>([T? result]) {
    Navigator.of(this).pop(result);
  }
}

// String? Function(BuildContext, String?)? 확장 - asValidator 메서드 추가
extension FormFieldValidatorExtension on String? Function(BuildContext, String?)? {
  FormFieldValidator<String> asValidator(BuildContext context) {
    return (value) => this?.call(context, value);
  }
}

// List 확장 메서드 추가
extension ListUtils<T> on List<T> {
  List<T> divide(Widget divider) {
    if (length < 2) return this;
    final List<T> result = [];
    for (var i = 0; i < length; i++) {
      result.add(this[i]);
      if (i != length - 1) {
        result.add(divider as T);
      }
    }
    return result;
  }
  List<T> addToEnd(T value) {
    return [...this, value];
  }
}
