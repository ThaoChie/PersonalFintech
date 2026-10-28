using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Owlfin.Application.Common.Interfaces;
using Owlfin.Application.DTOs;
using Owlfin.Application.Interfaces;
using Owlfin.Domain.Entities;

namespace Owlfin.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly ICurrentUserService _currentUserService;

        public TransactionsController(ITransactionService transactionService, ICurrentUserService currentUserService)
        {
            _transactionService = transactionService;
            _currentUserService = currentUserService;
        }

        // GET: api/Transactions (Lấy lịch sử giao dịch & Tìm kiếm)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions([FromQuery] string? keyword = null)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var list = await _transactionService.GetTransactionsAsync(userId, keyword);
            return Ok(list);
        }

        // POST: api/Transactions (Thêm giao dịch mới)
        [HttpPost]
        public async Task<ActionResult<Transaction>> PostTransaction([FromBody] TransactionDto dto)
        {
            int userId = _currentUserService.UserId;
            if (userId == 0) return Unauthorized();

            var transaction = await _transactionService.CreateTransactionAsync(userId, dto);
            return Ok(transaction);
        }
    }
}
