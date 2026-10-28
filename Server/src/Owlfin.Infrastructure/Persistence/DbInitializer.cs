using Owlfin.Domain.Entities;
using Owlfin.Infrastructure.Persistence.Context;

namespace Owlfin.Infrastructure.Persistence
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Kiểm tra xem database đã có User chưa, nếu chưa thì tạo User mẫu
            if (!context.Users.Any())
            {
                var user = new User
                {
                    Username = "thaochie",
                    Email = "thaochie@example.com",
                    FullName = "Thao Chie",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456")
                };
                context.Users.Add(user);
                context.SaveChanges();
            }

            var defaultUser = context.Users.First();

            if (context.Jars.Any())
            {
                return;
            }

            var jars = new Jar[]
            {
                new Jar { Name = "Thiết yếu (NEC)", Balance = 0, Percent = 55, Goal = 0, UserId = defaultUser.Id },
                new Jar { Name = "Hưởng thụ (PLAY)", Balance = 0, Percent = 10, Goal = 0, UserId = defaultUser.Id },
                new Jar { Name = "Đầu tư (FFA)", Balance = 0, Percent = 10, Goal = 0, UserId = defaultUser.Id },
                new Jar { Name = "Tiết kiệm dài hạn (LTSS)", Balance = 0, Percent = 10, Goal = 0, UserId = defaultUser.Id },
                new Jar { Name = "Cho đi (GIVE)", Balance = 0, Percent = 5, Goal = 0, UserId = defaultUser.Id },
                new Jar { Name = "Giáo dục (EDU)", Balance = 0, Percent = 10, Goal = 0, UserId = defaultUser.Id }
            };

            context.Jars.AddRange(jars);
            context.SaveChanges();
        }
    }
}
