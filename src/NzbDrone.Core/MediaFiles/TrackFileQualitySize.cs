using NzbDrone.Core.Qualities;

namespace NzbDrone.Core.MediaFiles
{
    public class TrackFileQualitySize
    {
        public QualityModel Quality { get; set; }
        public long Size { get; set; }
    }
}
