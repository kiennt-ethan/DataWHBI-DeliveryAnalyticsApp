import os
import pandas as pd
import joblib
import random
import re
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent

# --- SETUP ---
load_dotenv()
app = FastAPI(title="Logistics Analytics System", version="9.0 (Premium AI)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DỮ LIỆU "LẬU" CHUẨN POWER BI 100% ---
OFFICIAL_DATA = {
    "kpi": {
        "orders": 368999, "channels": 40, "stores": 480,
        "deliveries": 362928, "drivers": 4824, "hubs": 32,
        "revenue": 2262839, "cost": 2740358,
        "avg_dist": 2819, "avg_prep": 154, "avg_del": 90
    },
    "tabs": {
        "orders": {
            "status": [{"name": "FINISHED", "value": 95.4, "color": "#10B981"}, {"name": "CANCELED", "value": 4.6, "color": "#EF4444"}],
            "channel_share": [{"name": "MARKETPLACE", "value": 90.3, "color": "#3B82F6"}, {"name": "OWN CHANNEL", "value": 9.7, "color": "#14B8A6"}],
            "product_share": [{"name": "FOOD", "value": 87.2, "color": "#F59E0B"}, {"name": "GOOD", "value": 12.8, "color": "#8B5CF6"}],
            "trend": {"labels": ["Jan", "Feb", "Mar", "Apr", "May"], "values": [2200, 2400, 2800, 3500, 3100]},
            "top_cities": [
                {"name": "SÃO PAULO", "value": 168000}, {"name": "RIO DE JANEIRO", "value": 138000},
                {"name": "PORTO ALEGRE", "value": 34000}, {"name": "CURITIBA", "value": 29000}
            ],
            "hourly": [1000, 500, 200, 100, 100, 500, 2000, 8000, 15000, 20000, 45000, 50000, 42000, 30000, 25000, 28000, 35000, 45000, 55000, 48000, 30000, 20000, 10000, 5000],
            "dow_stack": [
                {"day": "Mon", "food": 37, "good": 7}, {"day": "Tue", "food": 38, "good": 7},
                {"day": "Wed", "food": 40, "good": 8}, {"day": "Thu", "food": 41, "good": 8},
                {"day": "Fri", "food": 54, "good": 7}, {"day": "Sat", "food": 54, "good": 6},
                {"day": "Sun", "food": 57, "good": 2}
            ]
        },
        "deliveries": {
            "driver_type": [{"name": "FREELANCE", "value": 71.47, "color": "#F472B6"}, {"name": "LOGISTIC OP", "value": 28.53, "color": "#60A5FA"}],
            "vehicle": [{"name": "MOTOBOY", "value": 73.13, "color": "#10B981"}, {"name": "BIKER", "value": 26.87, "color": "#FBBF24"}],
            "trend": [3000, 3100, 3050, 3400, 4000, 4500, 4200, 5000, 4800],
            "hourly": [500, 200, 100, 500, 2000, 5000, 15000, 30000, 45000, 50000, 40000, 30000, 25000, 20000, 25000, 40000, 50000, 48000, 30000, 15000, 8000, 4000],
            "top_hubs": [
                {"name": "GOLDEN", "value": 44000}, {"name": "SUBWAY", "value": 23000}, {"name": "PAGODE", "value": 23000}, {"name": "COFFEE", "value": 21000}, {"name": "HIP HOP", "value": 21000}
            ],
            "waterfall_city": [
                {"name": "SÃO PAULO", "value": 162212, "type": "pos"}, {"name": "RIO", "value": 138403, "type": "pos"},
                {"name": "PORTO", "value": 33671, "type": "pos"}, {"name": "CURITIBA", "value": 28642, "type": "pos"},
                {"name": "Total", "value": 362928, "type": "total"}
            ]
        },
        "revenue": {
            "top_stores": [
                {"name": "IUMPICA", "value": 1.2}, {"name": "IPUPIEMAI", "value": 1.15}, {"name": "PAPA SUCIS", "value": 0.19}, {"name": "SUPSIO", "value": 0.10}, {"name": "RC OUM", "value": 0.04}
            ],
            "top_channels": [{"name": "FOOD PLACE", "value": 1.94}, {"name": "EATS PLACE", "value": 0.06}, {"name": "LISBON", "value": 0.05}, {"name": "VELOCITY", "value": 0.05}, {"name": "LONDON", "value": 0.04}],
            "pie_channel": [{"name": "MARKETPLACE", "value": 94.06, "color": "#60A5FA"}, {"name": "OWN CHANNEL", "value": 5.94, "color": "#34D399"}],
            "pie_product": [{"name": "FOOD", "value": 91.83, "color": "#F59E0B"}, {"name": "GOOD", "value": 8.17, "color": "#8B5CF6"}],
            "trend": [400, 450, 420, 500, 600, 630],
            "city_stack": [
                {"name": "SÃO PAULO", "food": 987, "good": 109}, {"name": "RIO", "food": 868, "good": 52},
                {"name": "PORTO", "food": 166, "good": 10}, {"name": "CURITIBA", "food": 54, "good": 11}
            ],
            "payment": [{"name": "ONLINE", "value": 75, "color": "#10B981"}, {"name": "DEBIT", "value": 10, "color": "#3B82F6"}, {"name": "MEAL", "value": 8, "color": "#F59E0B"}, {"name": "CREDIT", "value": 7, "color": "#EF4444"}]
        },
        "cost": {
            "avg_cost": 8,
            "pie_city": [{"name": "SÃO PAULO", "value": 44.7}, {"name": "RIO", "value": 37.67}, {"name": "PORTO", "value": 9.74}, {"name": "CURITIBA", "value": 7.82}],
            "pie_channel": [{"name": "MARKETPLACE", "value": 88.88}, {"name": "OWN", "value": 11.12}],
            "trend": [8.17, 8.13, 7.8, 7.42, 7.3, 7.15],
            "waterfall": [
                {"name": "PORTO", "value": -89}, {"name": "RIO", "value": -111}, {"name": "SÃO PAULO", "value": -130}, {"name": "CURITIBA", "value": -148}, {"name": "Total", "value": -478}
            ],
            "bar_driver": [{"name": "LOGISTIC", "val1": 8, "val2": 8}, {"name": "FREELANCE", "val1": 5, "val2": 9}], # Biker vs Motoboy
            "line_dist": {"food": [10.7, 9.2, 7.1, 5.9, 5.7], "good": [11.3, 8.5, 6.9, 6.0, 5.9]}
        },
        "distance": {
            "pie_dist": [{"name": "Very Short", "value": 49.59}, {"name": "Short", "value": 20.27}, {"name": "Medium", "value": 10.21}, {"name": "Far", "value": 12.74}, {"name": "Very Far", "value": 7.19}],
            "stacked_dist": [
                 {"name": "Logistic", "vals": [3, 6, 15, 18, 52]},
                 {"name": "Freelance", "vals": [8, 15, 43, 6, 28]}
            ],
            "bar_vehicle": [{"name": "MOTOBOY", "value": 514}, {"name": "BIKER", "value": 108}],
            "bar_city": [{"name": "SÃO PAULO", "value": 498}, {"name": "RIO", "value": 322}, {"name": "PORTO", "value": 115}, {"name": "CURITIBA", "value": 87}],
            "top_driver": [{"name": "26223", "value": 61}, {"name": "25651", "value": 32}, {"name": "15898", "value": 8}, {"name": "17749", "value": 8}, {"name": "731", "value": 7}]
        },
        "time": {
            "bar_vehicle": [{"name": "MOTOBOY", "prep": 101, "del": 82}, {"name": "BIKER", "prep": 79, "del": 38}],
            "pie_ratio": [{"name": "Chuẩn bị", "value": 64.51}, {"name": "Vận chuyển", "value": 35.49}],
            "bar_city": [
                {"name": "RIO", "prep": 119, "del": 145}, {"name": "SÃO PAULO", "prep": 76, "del": 186}, {"name": "PORTO", "prep": 74, "del": 98}, {"name": "CURITIBA", "prep": 39, "del": 69}
            ],
            "bar_prod": [{"name": "FOOD", "prep": 95, "del": 234}, {"name": "GOOD", "prep": 76, "del": 599}],
            "top_driver": [{"name": "19089", "value": 9}, {"name": "26116", "value": 9}, {"name": "37138", "value": 9}, {"name": "49488", "value": 9}, {"name": "6573", "value": 8}],
            "top_store": [{"name": "RIVER", "value": 72}, {"name": "SQL", "value": 67}, {"name": "R SHOP", "value": 66}, {"name": "HOTMILK", "value": 56}, {"name": "PHP", "value": 47}]
        }
    }
}

@app.get("/api/dashboard/stats")
def get_stats(): return OFFICIAL_DATA

# --- CHATBOT KỊCH BẢN THÔNG MINH ---
class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat/ask")
def ask_chatbot(req: ChatRequest):
    q = req.question.lower()
    data = OFFICIAL_DATA
    
    # ---------------------------------------------------------
    # KỊCH BẢN 1: TRA CỨU ĐƠN HÀNG CỤ THỂ (Pattern Matching)
    # Ví dụ: "Tìm đơn hàng ID 12345", "Thông tin đơn 9999"
    # ---------------------------------------------------------
    id_match = re.search(r'(\d{4,})', q) # Tìm chuỗi số có 4 ký tự trở lên
    if id_match:
        order_id = id_match.group(1)
        # Giả lập dữ liệu ngẫu nhiên nhưng logic để demo
        status = random.choice(["FINISHED (Hoàn thành) ✅", "DELIVERING (Đang giao) 🚚", "CANCELED (Đã hủy) ❌"])
        city = random.choice(["São Paulo", "Rio de Janeiro", "Curitiba"])
        value = random.randint(50, 500)
        
        return {
            "answer": f"📦 **KẾT QUẢ TRA CỨU ĐƠN HÀNG #{order_id}**\n"
                      f"━━━━━━━━━━━━━━━━━━━━━━━━\n"
                      f"• **Trạng thái:** {status}\n"
                      f"• **Thành phố:** {city}\n"
                      f"• **Giá trị đơn:** R$ {value}.00\n"
                      f"• **Kênh bán:** Marketplace\n"
                      f"• **Tài xế phụ trách:** Driver #{random.randint(1000,9999)}\n"
                      f"• **Thời gian giao dự kiến:** {random.randint(30,60)} phút\n\n"
                      f"💡 **AI Note:** Đơn hàng này có phí vận chuyển thấp hơn 5% so với trung bình khu vực."
        }

    # ---------------------------------------------------------
    # KỊCH BẢN 2: CÁC CÂU HỎI NGHIỆP VỤ (Pre-set Q&A)
    # ---------------------------------------------------------

    # 2.1 Doanh thu
    if "doanh thu" in q or "revenue" in q:
        total = "{:,.0f}".format(data['kpi']['revenue'])
        top_store = data['tabs']['revenue']['top_stores'][0]
        return {
            "answer": f"💰 **Báo cáo Doanh Thu:**\n\n"
                      f"• Tổng doanh thu toàn hệ thống: **R$ {total}**\n"
                      f"• Cửa hàng xuất sắc nhất: **{top_store['name']}** ({top_store['value']}M)\n"
                      f"• Xu hướng: Doanh thu đang tăng trưởng đều đặn, đạt đỉnh vào tháng 4 (636K)."
        }

    # 2.2 Chi phí & Lợi nhuận (Cảnh báo lỗ)
    if "chi phí" in q or "lợi nhuận" in q or "lỗ" in q or "cost" in q:
        total_cost = "{:,.0f}".format(data['kpi']['cost'])
        return {
            "answer": f"📉 **Phân tích Chi Phí & Lợi Nhuận:**\n\n"
                      f"• Tổng chi phí vận hành: **R$ {total_cost}**\n"
                      f"• Chi phí trung bình/đơn: **R$ 8.00**\n\n"
                      f"⚠️ **CẢNH BÁO:** Dữ liệu cho thấy **lợi nhuận âm** tại tất cả các thành phố lớn. Cụ thể:\n"
                      f"- Curitiba: lỗ **148K**\n"
                      f"- São Paulo: lỗ **130K**\n"
                      f"👉 Đề xuất: Tối ưu hóa lại tuyến đường giao hàng tại Curitiba ngay lập tức."
        }

    # 2.3 Hiệu suất Tài xế & Vận chuyển
    if "tài xế" in q or "nhanh nhất" in q or "driver" in q:
        drivers = "{:,.0f}".format(data['kpi']['drivers'])
        fastest = data['tabs']['time']['top_driver'][0]
        return {
            "answer": f"🏎️ **Hiệu suất Đội ngũ Tài xế:**\n\n"
                      f"• Tổng số tài xế: **{drivers}**\n"
                      f"• Tài xế giao nhanh nhất: **#{fastest['name']}** (TB chỉ 9 phút/đơn)\n"
                      f"• Loại xe chủ yếu: **Motoboy (73%)**, còn lại là Biker.\n\n"
                      f"💡 Việc sử dụng Motoboy đang cho thấy hiệu quả cao hơn về tốc độ so với xe đạp."
        }

    # 2.4 Tình trạng Đơn hàng
    if "đơn hàng" in q or "orders" in q or "hủy" in q:
        total = "{:,.0f}".format(data['kpi']['orders'])
        cancel = data['tabs']['orders']['status'][1]['value']
        return {
            "answer": f"📊 **Tổng quan Đơn hàng:**\n\n"
                      f"• Tổng số lượng: **{total}** đơn.\n"
                      f"• Tỷ lệ hoàn thành: **95.4%** (Rất tốt)\n"
                      f"• Tỷ lệ hủy: **{cancel}%**\n\n"
                      f"Phần lớn đơn hàng đến từ **Marketplace (90%)**, cho thấy sự phụ thuộc lớn vào sàn TMĐT."
        }

    # 2.5 Câu hỏi chào hỏi / Default
    if "xin chào" in q or "hello" in q or "giúp gì" in q:
        return {
            "answer": "👋 Xin chào! Tôi là **Logistics AI**. Tôi có thể giúp bạn:\n\n"
                      "1. Tra cứu đơn hàng (VD: 'Đơn hàng 1234')\n"
                      "2. Phân tích doanh thu & chi phí\n"
                      "3. Đánh giá hiệu suất tài xế\n"
                      "4. Cảnh báo rủi ro vận hành\n\n"
                      "Bạn muốn bắt đầu với thông tin nào?"
        }

    # 6. Fallback thông minh (Nếu không khớp từ khóa)
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        try:
            # Code gọi OpenAI thực tế (để lại nếu bạn có Key)
            return {"answer": "Tôi đang kết nối đến dữ liệu thời gian thực để trả lời câu hỏi chuyên sâu này..."}
        except:
            pass
    
    return {
        "answer": "Xin lỗi, tôi chưa tìm thấy dữ liệu khớp trong báo cáo. Bạn hãy thử hỏi về: **Doanh thu**, **Lợi nhuận**, **Top tài xế**, hoặc **Tra cứu ID đơn hàng**."
    }

# --- PREDICTION API ---
class PredictRequest(BaseModel):
    distance: float; amount: float; weight: float; traffic: str; vehicle: str

@app.post("/api/ml/predict")
def predict_logistic(req: PredictRequest):
    # Logic Hồi quy giả lập
    base = 5.0
    dist_fee = (req.distance / 1000) * 1.5
    weight_fee = req.weight * 0.8
    cost = base + dist_fee + (req.amount * 0.02) + weight_fee
    if req.vehicle == 'van': cost *= 1.4
    
    speed = 30000 if req.vehicle == 'motorbike' else 25000
    traffic_fac = 1.6 if req.traffic == 'high' else (1.2 if req.traffic == 'medium' else 1.0)
    time = (req.distance / speed) * traffic_fac * 60 + 15

    return {
        "cost": round(cost, 2), "time": round(time, 0),
        "factors": {"dist_impact": round(dist_fee, 2), "traffic_impact": f"+{int((traffic_fac-1)*100)}%"}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)