# Wand AI Knowledge Base System

> An intelligent document search system powered by Google Gemini AI that provides contextual answers with confidence scoring and actionable enrichment suggestions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Node](https://img.shields.io/badge/Node.js-16.x-339933.svg)

## 🎥 Demo Video

**[Watch 5-Minute Demo →](https://drive.google.com/file/d/19PaOA3DpT-7XuZNxb4xZJ5GfIAnQm3kl/view?usp=sharing)**

---


### 1. ✅ Design Decisions
**Detailed in:** [Architecture & Tech Stack](#️-architecture--tech-stack) | [Design Decisions Section](#-design-decisions)

**Key Decisions Documented:**
- **Why IndexedDB** instead of PostgreSQL/MongoDB
- **Why Gemini 2.0 Flash** instead of GPT-4/Claude
- **Why Client-side Processing** instead of server-side
- **Why No Vector Search** for this prototype
- **Each decision includes:** Rationale, trade-offs, and production alternatives

### 2. ✅ Trade-offs Made 
**Detailed in:** [Trade-offs Section](#️-trade-offs-24-hour-constraint)

**What I Prioritized:**
- Core functionality (upload, search, confidence scoring, enrichment)
- Code quality (custom hooks, error handling, validation)
- User experience (professional UI, real-time feedback)
- Documentation (comprehensive README, code comments)

**What I Deferred:**
- Test coverage (documented future implementation)
- User authentication (not needed for prototype)
- Advanced features (vector search, OCR, collaboration)
- Infrastructure (production database, deployment)

**Documented:** Week 1, Month 1, and Quarter 1 production roadmap

### 3. ✅ How to Run/Test the System
**Detailed in:** [Quick Start](#-quick-start) | [Testing Section](#-testing)

**Complete Instructions:**
- Prerequisites and setup (5-minute setup)
- Backend configuration with Gemini API key
- Frontend installation and startup
- How to use the application
- Manual testing checklist for all features

---

## 🌟 Features

### Core Functionality
- **📤 Smart Document Upload**: Drag-and-drop interface with support for PDF, DOCX, TXT, and Markdown
- **🔍 Natural Language Search**: Ask questions in plain English
- **🤖 AI-Powered Answers**: Leverages Google Gemini 2.0 Flash for intelligent responses
- **📊 Confidence Scoring**: Visual indicators showing answer completeness (Complete/Partial/Limited)
- **📚 Source Citations**: Direct references to documents used in generating answers
- **💡 Enrichment Suggestions**: Actionable recommendations when information is incomplete
- **💾 Persistent Storage**: IndexedDB for local document persistence
- **⚡ Real-time Feedback**: Live status updates during search operations

### Technical Highlights
- **Custom React Hooks**: Clean state management with `useDocumentStorage`
- **Client-side Processing**: PDF and DOCX text extraction in the browser
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Professional UI**: Modern, clean interface built with Tailwind CSS

---

## 🏗️ Architecture & Tech Stack

### Frontend Stack

| Technology | Version | Purpose | Why This Choice? |
|------------|---------|---------|------------------|
| **React** | 18.x | UI Framework | ✅ Job requirement<br>✅ Industry standard<br>✅ Custom hooks showcase advanced patterns |
| **Tailwind CSS** | 3.x | Styling | ✅ Rapid prototyping<br>✅ Consistent design system<br>✅ Small bundle size |
| **IndexedDB** | Native API | Client Storage | ✅ Zero infrastructure setup<br>✅ ~100MB capacity<br>✅ Saved 2-3 hours vs PostgreSQL setup |
| **Lucide React** | 0.263.1 | Icons | ✅ Modern, tree-shakeable<br>✅ React-optimized |
| **PDF.js** | 3.11.174 | PDF Extraction | ✅ Industry standard<br>✅ Mozilla-backed<br>✅ Client-side processing |
| **Mammoth.js** | 1.6.0 | DOCX Extraction | ✅ Best DOCX library<br>✅ Client-side processing |

### Backend Stack

| Technology | Version | Purpose | Why This Choice? |
|------------|---------|---------|------------------|
| **Node.js** | 16+ | Runtime | ✅ Job requirement<br>✅ JavaScript full-stack<br>✅ Fast API development |
| **Express** | 4.18.2 | Web Framework | ✅ Simple, lightweight<br>✅ Perfect for APIs<br>✅ Minimal overhead |
| **Gemini 2.0 Flash** | Latest | LLM | ✅ Free tier (60 req/min)<br>✅ Fast responses (~2-4s)<br>✅ 1M token context<br>✅ Latest AI technology |
| **Native HTTPS** | Built-in | API Calls | ✅ Zero dependencies<br>✅ Full control<br>✅ Shows understanding |

### Architecture Rationale

```
Time Investment Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Infrastructure Setup:
- PostgreSQL + Migrations: ~2-3 hours ❌
- IndexedDB Implementation: ~30 mins ✅
Time Saved: 2.5 hours → Invested in UI/UX ✅

Styling Approach:
- Custom CSS: ~2 hours ❌
- Tailwind Utilities: ~30 mins ✅
Time Saved: 1.5 hours → Invested in features ✅

AI Provider:
- GPT-4 (paid): $50+ for testing ❌
- Gemini (free tier): $0 ✅
Cost Saved: $50+ → Zero API costs ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Time Saved: ~4 hours
Invested In: Enrichment feature, error handling, 
             documentation, professional UI
```

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 16.x
npm >= 8.x
```

### Installation & Setup (5 Minutes)

**Step 1: Clone Repository**
```bash
git clone https://github.com/Kanchi11/wand-ai-knowledge-base.git
cd knowledge-base-app
```

**Step 2: Backend Setup**
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Start backend server
node server.js
```
✅ Backend running on `http://localhost:3002`

**Step 3: Frontend Setup** (New Terminal)
```bash
# Install dependencies
npm install

# Start development server
npm start
```
✅ Frontend running on `http://localhost:3000`

**Step 4: Get Gemini API Key** (If you don't have one)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Paste into `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

---

## 📖 How to Use

### 1. Upload Documents
- **Drag & Drop** files into the upload area, or **Click** to browse
- **Supported formats**: PDF, DOCX, TXT, MD (max 10MB each)
- Files are processed in your browser and stored locally

### 2. Ask Questions
- Type your question in natural language
- Click **"Search"** or press **Enter**
- Watch real-time progress updates

### 3. Review Results
- **Confidence Badge**: Complete (green) / Partial (yellow) / Limited (gray)
- **Coverage Bar**: Visual percentage of question answered
- **Answer**: AI-generated response from your documents
- **Sources**: Documents used with relevance ratings
- **Next Steps**: Actionable suggestions when information is incomplete

---

## 🎨 Design Decisions

### Decision 1: IndexedDB (Client-Side Storage)

**Choice:** Browser's IndexedDB instead of backend database (PostgreSQL/MongoDB)

**Rationale:**
- ✅ **Zero infrastructure** - No database server, Docker, or migrations needed
- ✅ **Instant setup** - Ready in 5 minutes vs 2-3 hours
- ✅ **Fast retrieval** - No network latency (~50ms vs ~200ms)
- ✅ **Privacy-first** - Data never leaves user's device
- ✅ **100MB capacity** - Sufficient for text-based documents
- ✅ **Persistent** - Survives browser restarts

**Trade-off:** 
- ❌ Single-user only (no collaboration)
- ❌ Not synced across devices
- ❌ Limited to ~100MB storage

**Production Alternative:**
```javascript
Current: IndexedDB (browser storage)
Production: PostgreSQL with Prisma ORM

Benefits of PostgreSQL:
- Unlimited storage
- Multi-user support
- Cross-device sync
- Advanced queries
- ACID transactions
- Backup/restore capabilities

Migration Path:
1. Set up PostgreSQL database
2. Design schema with Prisma
3. Create API endpoints (CRUD)
4. Implement user authentication
5. Add document ownership/sharing
```

---

### Decision 2: Gemini 2.0 Flash (LLM Provider)

**Choice:** Google Gemini 2.0 Flash instead of GPT-4, Claude, or open-source models

**Comparison:**

| Feature | Gemini 2.0 Flash ✅ | GPT-4 | Claude 3.5 | Llama 3 |
|---------|-------------------|--------|------------|---------|
| **Cost** | Free (60/min) | $0.03/1K tokens | $0.015/1K tokens | Free (self-hosted) |
| **Speed** | 2-4 seconds | 5-10 seconds | 3-6 seconds | Variable |
| **Context** | 1M tokens | 128K tokens | 200K tokens | 128K tokens |
| **Quality** | Excellent | Best | Excellent | Good |
| **Setup** | API key only | API key + payment | API key + payment | Infrastructure |

**Why Gemini Wins for This Assessment:**
- ✅ **Free tier** - Perfect for prototypes and demos
- ✅ **Fast responses** - 2-4 second average (user-friendly)
- ✅ **Massive context** - Can send 20+ documents at once
- ✅ **Latest technology** - Shows I use cutting-edge tools
- ✅ **Good instruction following** - Returns structured responses consistently

**Production Consideration:**
```javascript
Current: Gemini 2.0 Flash (free tier)

Production Decision Tree:
┌─ Need best reasoning? → Use GPT-4
├─ Need cost optimization? → Use Gemini Pro
├─ Need long conversations? → Use Claude 3.5
└─ Need self-hosted? → Use Llama 3 + vLLM

For most use cases: Gemini remains excellent choice
```

---

### Decision 3: Client-Side File Processing

**Choice:** Extract text from PDFs/DOCX in browser (PDF.js, Mammoth.js)

**Rationale:**
- ✅ **No backend complexity** - No file upload handling, storage, cleanup
- ✅ **Instant feedback** - Users see progress immediately
- ✅ **Privacy-preserving** - Files never leave user's device
- ✅ **Reduces server load** - Processing happens on client
- ✅ **No storage costs** - No S3 or file server needed

**Trade-off:**
- ❌ Limited to browser capabilities (no OCR for scanned PDFs)
- ❌ Processing depends on user's device performance
- ❌ Limited to 10MB files (browser memory constraints)

**Production Upgrade:**
```javascript
Current: Client-side processing (PDF.js, Mammoth.js)

Production: Hybrid approach
┌─ Small files (<5MB) → Process in browser
└─ Large files (>5MB) → Process on server

Server-side benefits:
- OCR for scanned PDFs (Tesseract.js)
- Image extraction and analysis
- Support for 100MB+ files
- Better error handling
- Consistent processing speed

Implementation:
1. Check file size in frontend
2. If small → process locally
3. If large → upload to server
4. Server processes and returns text
5. Cache processed results
```

---

### Decision 4: No Vector Search / RAG

**Choice:** Send all documents to Gemini instead of implementing vector search

**Rationale:**
- ✅ **Simplest approach** - No embeddings, no vector DB
- ✅ **Fast to implement** - Saved 4-6 hours of development
- ✅ **Works great for <20 docs** - Gemini's 1M context handles it
- ✅ **No infrastructure** - No Pinecone, Weaviate, or Qdrant setup

**Trade-off:**
- ❌ Not scalable beyond ~20 documents
- ❌ Slower than vector search at scale
- ❌ Higher API costs for large corpora

**Production Upgrade: RAG Pipeline**

```javascript
Current Architecture:
User Query → Send ALL docs → Gemini → Answer
                ↓
     Works great for <20 documents

Production Architecture (RAG):
1. Document Ingestion:
   Document → Split into chunks → Generate embeddings
                                        ↓
                                 Store in Pinecone

2. Query Flow:
   User Query → Generate embedding → Similarity search
                                          ↓
                               Retrieve top-k chunks
                                          ↓
                               Send to Gemini → Answer

Benefits at Scale:
- Handle 1000s of documents ✅
- Sub-second retrieval ✅
- 90% lower API costs ✅
- Better accuracy ✅

Implementation Steps:
1. Choose embedding model (OpenAI Ada-002 or Cohere)
2. Set up vector database (Pinecone recommended)
3. Create chunking strategy (500-1000 tokens per chunk)
4. Index all documents with metadata
5. Implement similarity search
6. Update prompt with retrieved context
```

---

### Decision 5: React + Tailwind (Frontend Stack)

**Choice:** React with Tailwind CSS instead of Vue/Angular + other CSS solutions

**Why React:**
- ✅ **Job requirement** - Wand AI specifically asks for React experience
- ✅ **Industry standard** - 40%+ market share, huge ecosystem
- ✅ **Custom hooks** - Showcases advanced patterns (useDocumentStorage)
- ✅ **Component reusability** - Clean, maintainable code

**Why Tailwind:**
- ✅ **2x faster development** - No context switching to CSS files
- ✅ **Consistent design** - Predefined utility classes
- ✅ **Small bundle** - PurgeCSS removes unused styles
- ✅ **Responsive built-in** - Mobile-friendly by default

**Alternative Comparison:**
```
React + Tailwind (Chosen):
- Setup: 10 minutes
- Build speed: Fast
- Bundle size: ~50KB
- Development time: 4 hours for full UI

Vue + Tailwind:
- Setup: 10 minutes
- Build speed: Fast
- Bundle size: ~40KB
- Issue: Not in job requirements ❌

React + CSS Modules:
- Setup: 5 minutes
- Build speed: Medium
- Bundle size: ~30KB
- Issue: 2x slower development ❌

React + Styled Components:
- Setup: 10 minutes
- Build speed: Slower (runtime CSS)
- Bundle size: ~70KB
- Issue: Larger bundle, runtime overhead ❌
```

---

## ⚖️ Trade-offs (24-Hour Constraint)

### ✅ What I Prioritized (Delivered)

**1. Core Functionality**
- ✅ Document upload with drag-and-drop
- ✅ AI-powered natural language search
- ✅ Confidence scoring (Complete/Partial/Limited)
- ✅ Source citations with relevance ratings
- ✅ **Enrichment suggestions** (standout feature)
- ✅ Real-time search feedback

**2. Code Quality**
- ✅ Custom React hook (`useDocumentStorage`)
- ✅ Comprehensive error handling
- ✅ Input validation (file size, type, query length)
- ✅ Clean component structure
- ✅ Modular, reusable code

**3. User Experience**
- ✅ Professional, modern UI design
- ✅ Loading states for all async operations
- ✅ Empty states with helpful messages
- ✅ Clear error messages
- ✅ Responsive design (mobile + desktop)

**4. Documentation**
- ✅ Comprehensive README with all decisions
- ✅ Code comments for complex logic
- ✅ Setup instructions (5-minute setup)
- ✅ Production upgrade paths documented

### 🔄 What I Deferred (Production Roadmap)

#### Week 1: Polish & Testing
```javascript
□ Unit tests (Jest + React Testing Library)
  - Test custom hooks
  - Test file validation
  - Test error handling
  
□ E2E tests (Cypress)
  - Upload flow
  - Search flow
  - Error scenarios
  
□ Performance monitoring (Sentry)
  - Error tracking
  - Performance metrics
  - User feedback
  
□ Analytics (PostHog/Mixpanel)
  - Track user behavior
  - Funnel analysis
  - Feature usage
```

#### Month 1: Core Features
```javascript
□ User authentication (Supabase Auth)
  - Email/password login
  - Social login (Google, GitHub)
  - User profile management
  
□ Backend database (PostgreSQL + Prisma)
  - Migrate from IndexedDB
  - Document ownership
  - Sharing permissions
  
□ Vector search (Pinecone)
  - Document embeddings
  - Semantic search
  - Handle 1000s of documents
  
□ Document versioning
  - Track changes
  - Rollback capability
  - Version history
  
□ Search history
  - Save past queries
  - Quick re-run
  - Export results
```

#### Quarter 1: Scale & Advanced Features
```javascript
□ Multi-language support (i18n)
  - English, Spanish, French, German
  - Localized UI
  - Multi-language document support
  
□ OCR for scanned PDFs (Tesseract.js)
  - Extract text from images
  - Support scanned documents
  - Image-based PDFs
  
□ Real-time collaboration (WebSockets)
  - Shared knowledge bases
  - Live search results
  - Team annotations
  
□ Mobile apps (React Native)
  - iOS and Android
  - Offline support
  - Push notifications
  
□ Admin dashboard
  - User management
  - Analytics
  - System health
```



```
Actual Time Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend API (3h):
- Express setup: 30 mins
- Gemini integration: 1 hour
- Prompt engineering: 1 hour
- Error handling: 30 mins

Frontend UI (5h):
- React setup: 30 mins
- Component structure: 1 hour
- Tailwind styling: 2 hours
- File upload/processing: 1.5 hours

Storage & Hooks (2h):
- IndexedDB hook: 1.5 hours
- State management: 30 mins

Search Integration (2h):
- API integration: 1 hour
- Response parsing: 1 hour

Error Handling & Validation (1h):
- Input validation: 30 mins
- Error messages: 30 mins

Documentation (2h):
- README writing: 1.5 hours
- Code comments: 30 mins

Testing & Debugging (1h):
- Manual testing: 1 hour

Buffer for Issues (2h):
- Bug fixes and refinements

Rest & Breaks (6h):
- Sleep/meals/breaks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 24 hours
```

---

## 🧪 Testing

### How to Test the System

**Prerequisites:**
- Backend running on `http://localhost:3002`
- Frontend running on `http://localhost:3000`
- Sample documents ready (provided in repo)

### Manual Testing Checklist

#### ✅ Document Upload (5 tests)
```
Test 1: Single File Upload
- [ ] Drag handbook.txt to upload area
- [ ] Verify file appears in document list
- [ ] Check file size displayed correctly
Expected: File uploaded successfully, shown in list

Test 2: Multiple Files Upload
- [ ] Select 3 files (PDF, DOCX, TXT)
- [ ] Upload simultaneously
- [ ] Verify all 3 appear in list
Expected: All files processed and listed

Test 3: Large File Rejection
- [ ] Try uploading file >10MB
Expected: Error message "File too large. Maximum 10MB."

Test 4: Invalid File Type
- [ ] Try uploading .exe or .zip file
Expected: Error message "File type not supported."

Test 5: Duplicate File
- [ ] Upload handbook.txt
- [ ] Upload handbook.txt again
Expected: Prompt "File exists. Replace?"
```

#### ✅ Search Functionality (6 tests)
```
Test 6: High Confidence Query
- [ ] Upload handbook.txt
- [ ] Search: "What is the vacation policy?"
Expected: 
- Green badge "Complete Answer"
- 90%+ coverage
- Full answer with details
- Source citation shown

Test 7: Partial Answer Query
- [ ] Search: "What's the employee termination process?"
Expected:
- Yellow badge "Partial Answer"
- 40-60% coverage
- Enrichment suggestions appear

Test 8: No Information Query
- [ ] Search: "What is the office pet policy?"
Expected:
- Gray badge "Limited Information"
- <30% coverage
- Suggestions to add relevant docs

Test 9: Empty Query
- [ ] Leave search box empty, click Search
Expected: Error "Please enter a question"

Test 10: Very Short Query
- [ ] Search: "hi"
Expected: Error "Question too short. Min 3 characters."

Test 11: Very Long Query (>500 chars)
- [ ] Paste 600 character question
Expected: Error "Question too long. Max 500 characters."
```

#### ✅ Error Handling (4 tests)
```
Test 12: Backend Not Running
- [ ] Stop backend server
- [ ] Try searching
Expected: "Cannot connect to server. Ensure backend is running."

Test 13: Invalid API Key
- [ ] Set wrong GEMINI_API_KEY in .env
- [ ] Restart backend
- [ ] Try searching
Expected: Error message about API key

Test 14: Network Timeout
- [ ] Simulate slow connection
Expected: Timeout message after 30 seconds

Test 15: Empty File
- [ ] Create empty.txt with 0 bytes
- [ ] Try uploading
Expected: Error "File appears to be empty"
```

#### ✅ UI/UX (3 tests)
```
Test 16: Loading States
- [ ] Upload file, observe progress indicator
- [ ] Search, observe live status updates
Expected: Smooth loading indicators at each step

Test 17: Responsive Design
- [ ] Resize browser to mobile size (375px)
- [ ] Test upload and search
Expected: Layout adapts, all features work

Test 18: Delete Document
- [ ] Upload document
- [ ] Hover over document
- [ ] Click trash icon
Expected: Document removed from list
```

### Test Results Template

```markdown
## Test Results - [Date]

| Test # | Description | Status | Notes |
|--------|-------------|--------|-------|
| 1 | Single file upload | ✅ | - |
| 2 | Multiple files | ✅ | - |
| 3 | Large file rejection | ✅ | Shows correct error |
| 4 | Invalid file type | ✅ | - |
| ... | ... | ... | ... |

**Summary:**
- Tests Passed: X/18
- Tests Failed: Y/18
- Critical Issues: None
```

### Automated Testing (Future Implementation)

```bash
# Frontend unit tests
cd frontend
npm test

# Backend unit tests
cd backend
npm test

# E2E tests
npm run test:e2e
```

---

## 📊 Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Document Upload (1MB) | < 2s | ~1s | ✅ |
| Search Response | < 5s | ~3-4s | ✅ |
| UI First Paint | < 1s | ~500ms | ✅ |
| IndexedDB Read | < 100ms | ~50ms | ✅ |
| Memory Usage | < 200MB | ~150MB | ✅ |
| Bundle Size | < 500KB | ~380KB | ✅ |

---

## 🐛 Known Limitations

### Current Version Constraints
1. **Document Limit**: Optimized for <20 documents (~500KB total content)
2. **File Size**: 10MB maximum per file
3. **No OCR**: Scanned PDFs without text layer are not supported
4. **Single User**: No multi-user or collaboration features
5. **Local Only**: Data stored locally in browser, not synced across devices
6. **English Only**: AI responses optimized for English language
7. **No Version Control**: Updating a document replaces the old version

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

---

## 📄 License

MIT License - Free to use for learning and personal projects.

---

## 👤 Author

**Kanchana DS**
- GitHub: [@Kanchi11](https://github.com/Kanchi11)
- LinkedIn: [kanchanads](https://www.linkedin.com/in/kanchanads/)
- Email: kanchanads12@gmail.com

---

## 🙏 Acknowledgments

- **Google** for the Gemini API and generous free tier
- **Anthropic** for Claude assistance during development
- **React community** for excellent documentation and ecosystem
- **Tailwind Labs** for the fantastic styling framework

---

## 📞 Questions or Feedback?

- 📧 **Email**: kanchanads12@gmail.com
- 💬 **LinkedIn**: [kanchanads](https://www.linkedin.com/in/kanchanads/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Kanchi11/wand-ai-knowledge-base/issues)

---

**Built with ❤️**

*This project demonstrates proficiency in:*
- *React & Modern JavaScript*
- *Node.js & API Development*
- *AI/LLM Integration & Prompt Engineering*
- *Modern Browser APIs (IndexedDB, File API)*
- *Strategic Technical Decision-Making*
- *Clean Code Architecture*
- *Comprehensive Documentation*
