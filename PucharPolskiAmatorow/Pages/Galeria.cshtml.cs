using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace PucharPolskiAmatorow.Pages
{
    public class GaleriaModel : PageModel
    {
        private readonly IWebHostEnvironment _env;

        public GaleriaModel(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string[] Images { get; private set; } = [];

        public void OnGet()
        {
            var dir = System.IO.Path.Combine(_env.WebRootPath, "sources", "Arche1");
            if (System.IO.Directory.Exists(dir))
            {
                Images = System.IO.Directory.GetFiles(dir, "*.jpg")
                    .Select(f => "/sources/Arche1/" + System.IO.Path.GetFileName(f))
                    .OrderBy(f => f)
                    .ToArray();
            }
        }
    }
}
