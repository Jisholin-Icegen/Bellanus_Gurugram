using Microsoft.EntityFrameworkCore;

namespace Dial50_MVC_Core.Models
{
    [Keyless]
    public class NotificationModel
    {
        public int ID { get; set; }
        public string ORDER_ID { get; set; }
        public string ORDER_CODE { get; set; }
        public string ORDER_TYPE { get; set; }
        public string STATUS { get; set; }
        public int ITEM_COUNT { get; set; }
        public string ITEM_SUMMARY { get; set; }
        public bool IS_READ { get; set; }
        public string CREATED_DATE { get; set; }
        public string SERVICE { get; set; }
    }
}
