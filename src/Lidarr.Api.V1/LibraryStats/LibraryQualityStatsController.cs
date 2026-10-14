using System.Collections.Generic;
using Lidarr.Http;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.MediaFiles;

namespace Lidarr.Api.V1.LibraryStats
{
    [V1ApiController("librarystats/quality")]
    public class LibraryQualityStatsController : Controller
    {
        private readonly ILibraryQualityStatsService _libraryQualityStatsService;

        public LibraryQualityStatsController(ILibraryQualityStatsService libraryQualityStatsService)
        {
            _libraryQualityStatsService = libraryQualityStatsService;
        }

        [HttpGet]
        [Produces("application/json")]
        public List<LibraryQualityStatsResource> GetQualityStats()
        {
            return _libraryQualityStatsService.GetQualityStatistics().ConvertAll(LibraryQualityStatsResourceMapper.ToResource);
        }
    }
}
