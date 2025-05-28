import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:csv/csv.dart';
import 'package:synchronized/synchronized.dart';
import 'flutter_flow/flutter_flow_util.dart';
import 'dart:convert';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    secureStorage = FlutterSecureStorage();
    await _safeInitAsync(() async {
      _WordookList =
          (await secureStorage.getStringList('ff_WordookList'))?.map((x) {
                try {
                  return jsonDecode(x);
                } catch (e) {
                  print("Can't decode persisted json. Error: $e.");
                  return {};
                }
              }).toList() ??
              _WordookList;
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late FlutterSecureStorage secureStorage;

  /// 실험
  List<dynamic> _WordookList = [
    jsonDecode(
        '[{\"title\":\"토익 기초\",\"words\":[\"apple\",\"book\",\"cat\"]},{\"title\":\"수능 영단어\",\"words\":[\"gravity\",\"formula\"]}]')
  ];
  List<dynamic> get WordookList => _WordookList;
  set WordookList(List<dynamic> value) {
    _WordookList = value;
    secureStorage.setStringList(
        'ff_WordookList', value.map((x) => jsonEncode(x)).toList());
  }

  void deleteWordookList() {
    secureStorage.delete(key: 'ff_WordookList');
  }

  void addToWordookList(dynamic value) {
    WordookList.add(value);
    secureStorage.setStringList(
        'ff_WordookList', _WordookList.map((x) => jsonEncode(x)).toList());
  }

  void removeFromWordookList(dynamic value) {
    WordookList.remove(value);
    secureStorage.setStringList(
        'ff_WordookList', _WordookList.map((x) => jsonEncode(x)).toList());
  }

  void removeAtIndexFromWordookList(int index) {
    WordookList.removeAt(index);
    secureStorage.setStringList(
        'ff_WordookList', _WordookList.map((x) => jsonEncode(x)).toList());
  }

  void updateWordookListAtIndex(
    int index,
    dynamic Function(dynamic) updateFn,
  ) {
    WordookList[index] = updateFn(_WordookList[index]);
    secureStorage.setStringList(
        'ff_WordookList', _WordookList.map((x) => jsonEncode(x)).toList());
  }

  void insertAtIndexInWordookList(int index, dynamic value) {
    WordookList.insert(index, value);
    secureStorage.setStringList(
        'ff_WordookList', _WordookList.map((x) => jsonEncode(x)).toList());
  }
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}

extension FlutterSecureStorageExtensions on FlutterSecureStorage {
  static final _lock = Lock();

  Future<void> writeSync({required String key, String? value}) async =>
      await _lock.synchronized(() async {
        await write(key: key, value: value);
      });

  void remove(String key) => delete(key: key);

  Future<String?> getString(String key) async => await read(key: key);
  Future<void> setString(String key, String value) async =>
      await writeSync(key: key, value: value);

  Future<bool?> getBool(String key) async => (await read(key: key)) == 'true';
  Future<void> setBool(String key, bool value) async =>
      await writeSync(key: key, value: value.toString());

  Future<int?> getInt(String key) async =>
      int.tryParse(await read(key: key) ?? '');
  Future<void> setInt(String key, int value) async =>
      await writeSync(key: key, value: value.toString());

  Future<double?> getDouble(String key) async =>
      double.tryParse(await read(key: key) ?? '');
  Future<void> setDouble(String key, double value) async =>
      await writeSync(key: key, value: value.toString());

  Future<List<String>?> getStringList(String key) async =>
      await read(key: key).then((result) {
        if (result == null || result.isEmpty) {
          return null;
        }
        return CsvToListConverter()
            .convert(result)
            .first
            .map((e) => e.toString())
            .toList();
      });
  Future<void> setStringList(String key, List<String> value) async =>
      await writeSync(key: key, value: ListToCsvConverter().convert([value]));
}
