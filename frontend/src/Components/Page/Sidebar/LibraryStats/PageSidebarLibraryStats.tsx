import React from 'react';
import { useSelector } from 'react-redux';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import useLibraryStats, { LibraryStats, QualityStat } from './useLibraryStats';
import styles from './PageSidebarLibraryStats.css';

const MAX_FORMAT_SEGMENTS = 3;

const segmentClassNames = [
  styles.segment0,
  styles.segment1,
  styles.segment2,
  styles.segmentOther,
];

const LOGO = [
  '    .-"""""-.',
  "  .'  .---.  '.",
  ' /   / .-. \\   \\',
  '|   | ( o ) |   |',
  " \\   \\ '-' /   /",
  "  '.  '---'  .'",
  "    '-.....-'",
].join('\n');

interface FormatSegment {
  name: string;
  percent: number;
}

function getFormatSegments(
  qualities: QualityStat[],
  total: number
): FormatSegment[] {
  if (!total) {
    return [];
  }

  const top = qualities.slice(0, MAX_FORMAT_SEGMENTS);
  const otherCount = qualities
    .slice(MAX_FORMAT_SEGMENTS)
    .reduce((acc, q) => acc + q.trackFileCount, 0);

  const segments = top.map((q) => ({
    name: q.quality.name,
    percent: Math.round((q.trackFileCount / total) * 100),
  }));

  if (otherCount) {
    segments.push({
      name: translate('Other'),
      percent: Math.round((otherCount / total) * 100),
    });
  }

  return segments;
}

function getTotalQualityFiles(qualities: QualityStat[]) {
  return qualities.reduce((acc, q) => acc + q.trackFileCount, 0);
}

function StandardStats({ stats }: { stats: LibraryStats }) {
  const segments = getFormatSegments(
    stats.qualities,
    getTotalQualityFiles(stats.qualities)
  );

  return (
    <div className={styles.standard}>
      <div className={styles.header}>{translate('Library')}</div>

      <div className={styles.row}>
        <span className={styles.label}>{translate('Artists')}</span>
        <span className={styles.value}>
          {stats.artistCount.toLocaleString()}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{translate('Monitored')}</span>
        <span className={styles.value}>
          {stats.monitoredArtistCount.toLocaleString()}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{translate('Albums')}</span>
        <span className={styles.value}>
          {stats.albumCount.toLocaleString()}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{translate('Tracks')}</span>
        <span className={styles.value}>
          {stats.trackFileCount.toLocaleString()} /{' '}
          {stats.trackCount.toLocaleString()}
        </span>
      </div>

      <div className={styles.progress} title={`${stats.percentComplete}%`}>
        <div
          className={styles.progressBar}
          style={{ width: `${stats.percentComplete}%` }}
        />
      </div>

      <div className={styles.caption}>
        {translate('LibraryPercentComplete', {
          percent: stats.percentComplete,
        })}
      </div>

      <div className={styles.row}>
        <span className={styles.label}>{translate('SizeOnDisk')}</span>
        <span className={styles.value}>{formatBytes(stats.sizeOnDisk)}</span>
      </div>

      <div className={styles.header}>{translate('Formats')}</div>

      {segments.length ? (
        <>
          <div className={styles.formatBar}>
            {segments.map((segment, index) => (
              <div
                key={segment.name}
                className={segmentClassNames[index]}
                style={{ width: `${segment.percent}%` }}
                title={`${segment.name} ${segment.percent}%`}
              />
            ))}
          </div>

          {segments.map((segment, index) => (
            <div key={segment.name} className={styles.row}>
              <span className={styles.label}>
                <span className={segmentClassNames[index]} />
                {segment.name}
              </span>
              <span className={styles.value}>{segment.percent}%</span>
            </div>
          ))}

          <div className={styles.losslessRow}>
            <span>{translate('Lossless')}</span>
            <span>{stats.losslessPercent}%</span>
          </div>
        </>
      ) : (
        <div className={styles.caption}>{translate('NoTrackFilesYet')}</div>
      )}
    </div>
  );
}

function textBar(percent: number, width = 10) {
  const filled = Math.round((percent / 100) * width);

  return `[${'#'.repeat(filled)}${'-'.repeat(width - filled)}]`;
}

function FetchLine({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fetchLine}>
      <span className={styles.fetchKey}>{label.padEnd(9)}</span>
      <span className={styles.fetchValue}>{value}</span>
    </div>
  );
}

function FetchStats({ stats }: { stats: LibraryStats }) {
  const topQuality = stats.qualities[0];
  const totalQualityFiles = getTotalQualityFiles(stats.qualities);
  const host = window.location.hostname || 'localhost';

  return (
    <div className={styles.fetch}>
      <pre className={styles.logo}>{LOGO}</pre>

      <div className={styles.fetchTitle}>
        <span className={styles.fetchKey}>lidarr</span>@
        <span className={styles.fetchKey}>{host}</span>
      </div>
      <div className={styles.fetchRule}>{'-'.repeat(7 + host.length)}</div>

      <FetchLine
        label="Artists"
        value={`${stats.artistCount} (${stats.monitoredArtistCount} mon)`}
      />
      <FetchLine label="Albums" value={`${stats.albumCount}`} />
      <FetchLine
        label="Tracks"
        value={`${stats.trackFileCount}/${stats.trackCount}`}
      />
      <FetchLine
        label="Done"
        value={`${textBar(stats.percentComplete)} ${stats.percentComplete}%`}
      />
      <FetchLine label="Disk" value={formatBytes(stats.sizeOnDisk)} />

      {topQuality ? (
        <>
          <FetchLine
            label="Top Fmt"
            value={`${topQuality.quality.name} (${Math.round(
              (topQuality.trackFileCount / totalQualityFiles) * 100
            )}%)`}
          />
          <FetchLine label="Lossless" value={`${stats.losslessPercent}%`} />
        </>
      ) : null}

      <FetchLine label="Version" value={window.Lidarr.version} />

      <div className={styles.palette}>
        {[...Array(8).keys()].map((i) => (
          <span
            key={i}
            className={styles[`color${i}` as keyof typeof styles]}
          />
        ))}
      </div>
    </div>
  );
}

function LibraryStatsPanel({ style }: { style: string }) {
  const stats = useLibraryStats();

  if (style === 'fetch') {
    return <FetchStats stats={stats} />;
  }

  return <StandardStats stats={stats} />;
}

function PageSidebarLibraryStats() {
  const { sidebarLibraryStats } = useSelector(createUISettingsSelector());

  // Keep the stats hook (and its API call) out of the tree when turned off
  if (!sidebarLibraryStats || sidebarLibraryStats === 'off') {
    return null;
  }

  return <LibraryStatsPanel style={sidebarLibraryStats} />;
}

export default PageSidebarLibraryStats;
