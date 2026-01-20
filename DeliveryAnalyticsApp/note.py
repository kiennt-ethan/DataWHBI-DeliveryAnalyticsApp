# Kỹ thuật: Sử dụng Pandas để Merge 7 bảng CSV thành 1 Master Data
df = pd.merge(orders, stores, on='store_id', how='left')
df = pd.merge(df, hubs, on='hub_id', how='left')
# ... (các lệnh merge khác)

# Kỹ thuật: Xử lý dữ liệu nhiễu (Null/String -> Number/Datetime)
df['order_amount'] = pd.to_numeric(df['order_amount'], errors='coerce').fillna(0)
df['order_moment_created'] = pd.to_datetime(df['order_moment_created'], errors='coerce')

# Kỹ thuật: Huấn luyện mô hình Random Forest
model = RandomForestRegressor(n_estimators=30, random_state=42)
model.fit(data_ml[features], data_ml[target])

# Kỹ thuật: Model Persistence (Lưu model ra ổ cứng bằng Joblib)
if not os.path.exists(MODEL_DIR): os.makedirs(MODEL_DIR)
joblib.dump(model, MODEL_PATH) 

# Kỹ thuật: Load model khi khởi động Server (tránh train lại)
state.model = joblib.load(MODEL_PATH)

# Kỹ thuật: Khởi tạo Pandas DataFrame Agent
agent = create_pandas_dataframe_agent(
    llm, 
    state.df, 
    verbose=True,
    allow_dangerous_code=True,
    agent_type="openai-tools", # Sử dụng Tools của OpenAI để reasoning tốt hơn
)

# Kỹ thuật: Prompt Engineering (Gắn ngữ cảnh vào câu hỏi)
query_with_context = f"""
Dữ liệu có các cột thời gian là 'order_moment_created' và 'order_moment_finished'.
Câu hỏi: {req.question}
"""

# Kỹ thuật: Định nghĩa Endpoint API bất đồng bộ
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    # Logic tính toán KPI...
    return { "kpi": kpi, "charts": ... }

@app.post("/api/ml/predict")
def predict_cost(req: PredictRequest):
    # Logic dự báo...
    return {"predicted_cost": pred[0]}