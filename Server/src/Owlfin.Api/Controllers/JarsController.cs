using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Api.Controllers
{
    [Route("api/[controller]")]
    [Route("api/Jas")]
    [ApiController]
    [Authorize]
    public class JarsController : ControllerBase
    {
        private readonly IJarService _jarService;
        private readonly ICurrentUserService _currentUserService;

        public JarsController(IJarService jarService, ICurrentUserService currentUserService)
        {
            _jarService = jarService;
            _currentUserService = currentUserService;
        }

        // GET: api/Jars
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Jar>>> GetJars()
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var jars = await _jarService.GetJarsByUserIdAsync(userId);
            return Ok(jars);
        }

        // POST: api/Jars (Tạo mới)
        [HttpPost]
        public async Task<ActionResult<Jar>> PostJar([FromBody] Jar jar)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var created = await _jarService.CreateJarAsync(userId, jar);
            return CreatedAtAction("GetJars", new { id = created.Id }, created);
        }

        // PUT: api/Jars/5 (Chỉnh sửa / Thiết lập mục tiêu)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJar(int id, [FromBody] Jar jarData)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            bool updated = await _jarService.UpdateJarAsync(userId, id, jarData);
            if (!updated)
            {
                return NotFound("Không tìm thấy hũ này hoặc bạn không có quyền sửa.");
            }

            return NoContent();
        }

        // DELETE: api/Jars/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJar(int id)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            bool deleted = await _jarService.DeleteJarAsync(userId, id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
