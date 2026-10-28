namespace Owlfin.Application.Common.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException() : base() { }

        public NotFoundException(string message) : base(message) { }

        public NotFoundException(string name, object key)
            : base($"Entity \"{name}\" ({key}) không tồn tại.") { }
    }

    public class ValidationException : Exception
    {
        public ValidationException() : base("Một hoặc nhiều lỗi xác thực dữ liệu đã xảy ra.") { }

        public ValidationException(string message) : base(message) { }
    }

    public class UnauthorizedException : Exception
    {
        public UnauthorizedException() : base("Bạn chưa được xác thực hoặc không có quyền truy cập.") { }

        public UnauthorizedException(string message) : base(message) { }
    }
}
