using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Qualities;

namespace Lidarr.Api.V1.LibraryStats
{
    public class LibraryQualityStatsResource
    {
        public Quality Quality { get; set; }
        public bool IsLossless { get; set; }
        public int TrackFileCount { get; set; }
        public long SizeOnDisk { get; set; }
    }

    public static class LibraryQualityStatsResourceMapper
    {
        public static LibraryQualityStatsResource ToResource(LibraryQualityStatistic model)
        {
            return new LibraryQualityStatsResource
            {
                Quality = model.Quality,
                IsLossless = model.IsLossless,
                TrackFileCount = model.TrackFileCount,
                SizeOnDisk = model.SizeOnDisk
            };
        }
    }
}
