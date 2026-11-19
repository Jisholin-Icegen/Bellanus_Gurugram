namespace Dial50_MVC_Core.Models
{
    public class FoodResponse
    {
        public List<MenuItem> MenuItems { get; set; } = new();
        public List<MenuItem> Recommendations { get; set; } = new();

    }

    public class MenuItem
    {
        public int Id { get; set; }
        public string FoodName { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string MealTiming { get; set; }
        public string AllowedDietType { get; set; }
        public string Allergens { get; set; }
        public string Tags { get; set; }
        public string ImagePath { get; set; }
        public int IsDefaultOrder { get; set; }
        public decimal AvgRating { get; set; }
        public int TotalRatings { get; set; }
        public int? Calories { get; set; }
        public string Protein { get; set; }
        public string Carbs { get; set; }  
        public string TotalFat { get; set; }
        public string Sodium { get; set; }  
        public string Sugar { get; set; }   
        public string Ingredients { get; set; }

        public string AllergensDietaryFlags { get; set; }
        public string DietaryType { get; set; }
        public decimal? Price { get; set; }    
    }
}