import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/data/station_catalog.dart';
import 'dashboard_controller.dart';
import 'dashboard_models.dart';

class ChangeStationSheet extends ConsumerWidget {
  const ChangeStationSheet({super.key, required this.city});

  final String city;

  static Future<void> show(BuildContext context, String city) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => ChangeStationSheet(city: city),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stations = stationCatalog
        .expand((s) => s.cities)
        .where((c) => c.city == city)
        .expand((c) => c.stations)
        .toList();

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.4,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Change Station ($city)',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            if (stations.isEmpty)
              const Expanded(
                child: Center(child: Text('No stations found for this city.')),
              )
            else
              Expanded(
                child: ListView.builder(
                  controller: scrollController,
                  itemCount: stations.length,
                  itemBuilder: (context, index) {
                    final station = stations[index];
                    return ListTile(
                      title: Text(station.name),
                      onTap: () {
                        ref.read(dashboardControllerProvider.notifier).setStation(station.name);
                        Navigator.of(context).pop();
                      },
                    );
                  },
                ),
              ),
          ],
        );
      },
    );
  }
}

class CompareCitySheet extends StatefulWidget {
  const CompareCitySheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => const CompareCitySheet(),
    );
  }

  @override
  State<CompareCitySheet> createState() => _CompareCitySheetState();
}

class _CompareCitySheetState extends State<CompareCitySheet> {
  String? _state;
  String? _city;
  String? _station;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Compare AQI'),
        leading: const CloseButton(),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DropdownMenu<String>(
              label: const Text('State'),
              width: MediaQuery.of(context).size.width - 32,
              onSelected: (value) {
                setState(() {
                  _state = value;
                  _city = null;
                  _station = null;
                });
              },
              dropdownMenuEntries: stationCatalog
                  .map((s) => DropdownMenuEntry(value: s.state, label: s.state))
                  .toList(),
            ),
            if (_state != null) ...[
              const SizedBox(height: 16),
              DropdownMenu<String>(
                label: const Text('City'),
                width: MediaQuery.of(context).size.width - 32,
                onSelected: (value) {
                  setState(() {
                    _city = value;
                    _station = null;
                  });
                },
                dropdownMenuEntries: stationCatalog
                    .firstWhere((s) => s.state == _state)
                    .cities
                    .map((c) => DropdownMenuEntry(value: c.city, label: c.city))
                    .toList(),
              ),
            ],
            if (_city != null) ...[
              const SizedBox(height: 16),
              DropdownMenu<String>(
                label: const Text('Station (Optional)'),
                width: MediaQuery.of(context).size.width - 32,
                onSelected: (value) {
                  setState(() => _station = value);
                },
                dropdownMenuEntries: stationCatalog
                    .firstWhere((s) => s.state == _state)
                    .cities
                    .firstWhere((c) => c.city == _city)
                    .stations
                    .map((st) => DropdownMenuEntry(value: st.name, label: st.name))
                    .toList(),
              ),
            ],
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _city == null
                  ? null
                  : () {
                      Navigator.of(context).pop();
                      CompareResultSheet.show(context, _city!, _station);
                    },
              child: const Text('View AQI'),
            ),
          ],
        ),
      ),
    );
  }
}

class CompareResultSheet extends ConsumerWidget {
  const CompareResultSheet({super.key, required this.city, this.station});

  final String city;
  final String? station;

  static Future<void> show(BuildContext context, String city, String? station) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => CompareResultSheet(city: city, station: station),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final aqiFuture = ref.watch(dashboardControllerProvider.notifier).fetchAqi(station ?? '', city);

    return DraggableScrollableSheet(
      initialChildSize: 0.5,
      maxChildSize: 0.8,
      minChildSize: 0.4,
      expand: false,
      builder: (context, scrollController) {
        return FutureBuilder<AqiReading?>(
          future: aqiFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            }
            final aqi = snapshot.data;
            if (aqi == null) {
              return const Center(child: Text('AQI data not found for this location.'));
            }

            return Padding(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollController,
                children: [
                  Text(
                    'AQI in $city${station != null ? ' ($station)' : ''}',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          Text(
                            '${aqi.aqi}',
                            style: const TextStyle(
                              fontSize: 64,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            alignment: WrapAlignment.center,
                            children: [
                              Chip(label: Text('PM2.5: ${aqi.pm25}')),
                              Chip(label: Text('PM10: ${aqi.pm10}')),
                              Chip(label: Text('NO2: ${aqi.no2}')),
                              Chip(label: Text('SO2: ${aqi.so2}')),
                              Chip(label: Text('CO: ${aqi.co}')),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
