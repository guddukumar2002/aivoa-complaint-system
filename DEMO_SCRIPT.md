# Demo Script: AI-Powered Complaint Management System

**Duration**: 10–15 Minutes  
**Target Audience**: Engineering Teams, Product Owners, Compliance Officers  
**Presenter**: Lead System Architect / Software Engineer

---

## 🎬 Part 1: Introduction & System Architecture (3 Minutes)

### 🖥️ Action on Screen
- Show the **Dashboard Page** in the application interface (switch themes between Light and Dark mode once or twice to show smooth visual transitions).
- Open the Mermaid architecture diagram from the [README.md](file:///e:/aivoa-complaint-system/README.md) on the screen.

### 🎙️ Narrator Script
> "Welcome, everyone, to the demonstration of our AI-Powered Complaint Management System. 
> 
> In medical and pharmaceutical sectors, handling customer complaints about drug quality or adverse events is highly regulated and time-sensitive. Standard manual workflows lead to delays, transcription errors, and slow audits. 
> 
> Our system introduces a robust, full-stack application designed to solve this. It is structured into three main layers:
>
> 1. **The Client Layer**: A responsive React single-page application built with Material UI, Redux Toolkit, and RTK Query. It supports real-time form inputs, accessible controls, smooth micro-interactions, and a persisted Dark Mode context.
> 2. **The Server Layer**: A FastAPI backend chosen for high performance, rapid asynchronous execution, and automated Pydantic schema validation. Data persistence is managed via SQLAlchemy ORM.
> 3. **The AI Analysis Layer**: An advanced agentic workflow orchestrated by LangGraph and powered by Groq's high-speed Cloud API using `gemma2-9b-it`.
>
> Let's look at the database schema supporting this architecture. We track five primary tables: `users` for RBAC auth, `complaints` for storing ingested records, `ai_analysis` for structured pipeline results, `complaint_documents` for attachments, and `complaint_timeline` which acts as our tamper-proof compliance audit log."

---

## 🤖 Part 2: The LangGraph Pipeline & AI Workflow (3 Minutes)

### 🖥️ Action on Screen
- Open [backend/app/ai/graph.py](file:///e:/aivoa-complaint-system/backend/app/ai/graph.py) in the IDE.
- Scroll down to the `_build_graph` definition showing the nodes (`extract`, `validate`, `completeness`, `duplicate_detect`, `generate_summary`, `risk_classify`, `root_cause`, `capa`, and `format_output`).

### 🎙️ Narrator Script
> "Now let's dive into the core AI intelligence engine. Instead of running a single, long prompt that suffers from context loss and output drift, we structured our pipeline as an agentic state graph using **LangGraph**.
> 
> This architecture provides three critical technical advantages:
> 
> 1. **Compiled-Once Reusability**: At the bottom of `graph.py`, you can see `complaint_graph = _build_graph().compile()`. Graph compilation constructs the state layout and transition maps. Because this is computationally expensive, we compile it once at the module level when the server boots. Each incoming HTTP request simply runs a new execution thread of this pre-compiled graph, yielding sub-second latencies.
> 2. **State Merging and Accumulators**: The graph state is a `TypedDict` defined in `state.py`. When a node completes, it returns only the fields it modified. LangGraph automatically merges these updates back into the master state. Crucially, fields like `validation_issues` and `errors` are annotated with `operator.add`. This acts as an accumulator, allowing multiple independent nodes to log issues without overwriting each other.
> 3. **Conditional Routing**: The workflow isn't strictly linear. For example, after `validate_complaint`, we use a conditional router. If the complaint is flagged as spam or gibberish, the router bypasses completeness, duplicate checks, and risk analysis, sending it straight to the formatter. This saves significant LLM tokens and execution time. Similarly, if the complaint is flagged as a duplicate of an existing ticket, we skip RCA and CAPA generation, linking it immediately to the original."

---

## 🎙️ Part 3: Live Demo — Patient Interview & AI Copilot (4 Minutes)

### 🖥️ Action on Screen
- In the frontend, navigate to **New Complaint** (confirm that the global progress loader at the top of the viewport animates briefly during loading).
- Show the **AI Copilot** panel on the page.
- Paste the following mock patient chat log into the Copilot text box:
  ```text
  Agent: Hello, thank you for contacting PharmaCare. How can I help you today?
  Patient: Hi, I've been taking the Lipitral drug from Batch 4022A, Lot 99. The expiry date is 12/2027. I started getting severe muscle aches and dizziness yesterday. My name is John Miller.
  Agent: I am sorry to hear that. We will log this immediately.
  ```
- Click **Extract with AI**. Show the loading skeleton overlay on the form fields while the request is in flight.
- Once completed, show the populated form fields: John Miller under Customer Name, Lipitral under Product Name, Batch 4022A, Lot 99, and the details.
- Point out the **blue highlights** and the **AI tooltip** showing confidence scores.
- Click on the "Customer Name" field, type something else, and show that the blue AI indicator disappears immediately.

### 🎙️ Narrator Script
> "Let's demonstrate how this works in practice during a real-time patient interview. Imagine a customer support agent on the phone with a patient, logging details.
> 
> Instead of manually typing each lot number, drug name, and dates, the agent can paste the raw chat conversation or audio transcription directly into the **AI Copilot** panel.
> 
> When I click 'Extract with AI', the copilot calls our fast extraction node. You can see the fields populate instantly: John Miller is extracted as the customer, Lipitral as the product, along with the batch and lot number.
> 
> Notice the blue outlines around these fields. These are **confidence badges**. They tell the agent that these inputs were auto-filled by the AI. Hovering over a badge reveals the confidence rating. 
> 
> To prevent **automation bias** (where agents blindly trust whatever the AI fills in), the moment I click into an auto-filled field and edit the text, the blue highlight clears. This visually commits the field to human control and logs the change to the audit state."

---

## 🔍 Part 4: Live Demo — Complaint Detail & AI Analysis Audit (3 Minutes)

### 🖥️ Action on Screen
- Click **Submit Complaint**.
- Show the **Toast Notification** 'Complaint created successfully' popup in the bottom right corner.
- Navigate to the new complaint's detail page.
- Click on the **AI Analysis** tab and click **Run AI Pipeline**. Show the global progress bar loader at the top of the screen animating.
- Once completed, walk through the structured results card: Sentiment, Completeness Score (with missing details checklist), Risk Classification, Root Cause Analysis, and the Drafted Customer Response.
- Click **Delete** on a document or the complaint itself, and show the styled **Confirmation Dialog** modal popping up instead of a standard browser window alert.

### 🎙️ Narrator Script
> "Upon submitting, we see a toast alert in the bottom corner confirming success. Now we are redirected to the Complaint Details page. 
> 
> If we want to execute a deeper regulatory analysis, we click the 'AI Analysis' tab and click 'Run AI Pipeline'. The global progress loader activates at the top of the viewport.
> 
> The full LangGraph workflow has now run. Let's look at the results:
> - **Sentiment Analysis**: Evaluated as Negative with a score of 0.88, which is expected for muscle aches.
> - **Completeness Assessment**: The AI flags that we are missing the patient's age and dosage details. This checklist helps agents follow up for compliance.
> - **Risk and Severity**: Categorized as 'Critical' risk because severe muscle pain can indicate rhabdomyolysis, recommending 'High' priority.
> - **Root Cause & CAPA**: The pipeline suggests manufacturing checks for Batch 4022A and recommends preventive sample testing.
> - **Suggested Response**: A polite, regulatory-compliant email is pre-drafted for John Miller. I can copy this text with one click.
> 
> If I attempt to delete an attachment or complaint, our custom React confirmation dialog steps in. By replacing standard browser dialogs with these styled modals, we maintain consistent dark-mode styling and keep users focused on their actions."

---

## 💡 Part 5: Major Design Decisions & Conclusion (2 Minutes)

### 🖥️ Action on Screen
- Navigate back to the **Dashboard** and hover over the breakdown charts showing interactive tooltip animations.
- Show the final screen with the project repository.

### 🎙️ Narrator Script
> "To conclude, I'd like to summarize the major design decisions that make this system robust and production-ready:
> 
> 1. **Stateless Backend, State-Accumulating Pipeline**: The FastAPI backend remains stateless and highly scalable, while the state is managed on a per-request basis inside LangGraph.
> 2. **Decoupled AI Pipeline**: The LangGraph engine runs completely out-of-process from the database writes, allowing us to log complaints first, and run intensive AI audits asynchronously.
> 3. **Redux Global Loader Middleware**: Rather than manually managing loading hooks inside every individual React component, we built a global middleware in the Redux store. Any async action or RTK query automatically updates the global progress bar, keeping the frontend UI clean and highly responsive.
> 4. **User-in-the-loop (A/B UI)**: By visually separating AI-filled fields and forcing confirmation prompts for destructive actions, we build safety directly into the user interface.
> 
> Thank you for your time. I am happy to open the floor to any questions about our architecture or the LangGraph implementation."
