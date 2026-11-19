namespace Dial50_MVC_Core.Models
{
    public class FoodCartModel
    {
        public string RoomNo { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public string ItemDesc { get; set; }
        public int Quantity { get; set; }
        public string OrderType { get; set; } 
        public string MealType { get; set; }

        public int Calories { get; set; }

        public decimal? Price { get; set; }        
        public string DietaryType { get; set; }    
    }
}