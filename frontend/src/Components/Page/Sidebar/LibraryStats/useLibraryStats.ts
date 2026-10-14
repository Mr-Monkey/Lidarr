import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import createAllArtistSelector from 'Store/Selectors/createAllArtistSelector';
import createAjaxRequest from 'Utilities/createAjaxRequest';

export interface QualityStat {
  quality: {
    id: number;
    name: string;
  };
  isLossless: boolean;
  trackFileCount: number;
  sizeOnDisk: number;
}

export interface LibraryStats {
  artistCount: number;
  monitoredArtistCount: number;
  albumCount: number;
  trackCount: number;
  trackFileCount: number;
  sizeOnDisk: number;
  percentComplete: number;
  qualities: QualityStat[];
  losslessPercent: number;
}

function useLibraryStats(): LibraryStats {
  const artists = useSelector(createAllArtistSelector());
  const [qualities, setQualities] = useState<QualityStat[]>([]);

  const counts = useMemo(() => {
    return artists.reduce(
      (acc, artist) => {
        const statistics = artist.statistics;

        acc.artistCount++;

        if (artist.monitored) {
          acc.monitoredArtistCount++;
        }

        if (statistics) {
          acc.albumCount += statistics.albumCount || 0;
          acc.trackCount += statistics.trackCount || 0;
          acc.trackFileCount += statistics.trackFileCount || 0;
          acc.sizeOnDisk += statistics.sizeOnDisk || 0;
        }

        return acc;
      },
      {
        artistCount: 0,
        monitoredArtistCount: 0,
        albumCount: 0,
        trackCount: 0,
        trackFileCount: 0,
        sizeOnDisk: 0,
      }
    );
  }, [artists]);

  const { trackFileCount } = counts;

  // Re-fetch the format breakdown whenever the number of files on disk changes
  useEffect(() => {
    const { request, abortRequest } = createAjaxRequest({
      global: false,
      dataType: 'json',
      url: '/librarystats/quality',
    });

    request.done((data: QualityStat[]) => {
      setQualities(data);
    });

    return () => {
      abortRequest();
    };
  }, [trackFileCount]);

  const qualityFileCount = qualities.reduce(
    (acc, q) => acc + q.trackFileCount,
    0
  );

  const losslessFileCount = qualities.reduce(
    (acc, q) => (q.isLossless ? acc + q.trackFileCount : acc),
    0
  );

  return {
    ...counts,
    percentComplete: counts.trackCount
      ? Math.round((counts.trackFileCount / counts.trackCount) * 100)
      : 0,
    qualities,
    losslessPercent: qualityFileCount
      ? Math.round((losslessFileCount / qualityFileCount) * 100)
      : 0,
  };
}

export default useLibraryStats;
