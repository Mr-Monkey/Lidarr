using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.MediaFiles
{
    public interface ILibraryQualityStatsService
    {
        List<LibraryQualityStatistic> GetQualityStatistics();
    }

    public class LibraryQualityStatistic
    {
        public Quality Quality { get; set; }
        public bool IsLossless { get; set; }
        public int TrackFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public class LibraryQualityStatsService : ILibraryQualityStatsService
    {
        private static readonly HashSet<int> LosslessQualityIds = new HashSet<int>
        {
            Quality.FLAC.Id,
            Quality.FLAC_24.Id,
            Quality.ALAC.Id,
            Quality.ALAC_24.Id,
            Quality.APE.Id,
            Quality.WAVPACK.Id,
            Quality.WAV.Id
        };

        private readonly IMediaFileRepository _mediaFileRepository;

        public LibraryQualityStatsService(IMediaFileRepository mediaFileRepository)
        {
            _mediaFileRepository = mediaFileRepository;
        }

        public List<LibraryQualityStatistic> GetQualityStatistics()
        {
            return _mediaFileRepository.GetQualityAndSize()
                .GroupBy(f => f.Quality?.Quality ?? Quality.Unknown)
                .Select(g => new LibraryQualityStatistic
                {
                    Quality = g.Key,
                    IsLossless = LosslessQualityIds.Contains(g.Key.Id),
                    TrackFileCount = g.Count(),
                    SizeOnDisk = g.Sum(f => f.Size)
                })
                .OrderByDescending(s => s.TrackFileCount)
                .ToList();
        }
    }
}
