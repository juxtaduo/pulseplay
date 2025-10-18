#!/bin/bash
# Quick Start Script for Phase 7 & 8 Testing

echo "🚀 Starting PulsePlay AI - Phase 7 & 8 Testing"
echo "=============================================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "   Start it with: sudo systemctl start mongod"
    echo "   Or: mongod --dbpath ~/data/db"
    exit 1
fi

echo "✅ MongoDB is running"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "   Create .env with:"
    echo "   GEMINI_API_KEY=your_key_here"
    echo "   AUTH0_DOMAIN=your_domain"
    echo "   AUTH0_CLIENT_ID=your_client_id"
    exit 1
fi

echo "✅ .env file found"
echo ""
echo "Starting servers..."
echo ""

# Open testing guide
echo "📖 Opening testing guide..."
echo "   File: docs/PHASE_7_8_TESTING_GUIDE.md"
echo ""

# Instructions
echo "🎯 Next Steps:"
echo "   1. Frontend: http://localhost:5174 (already running)"
echo "   2. Backend: http://localhost:3001 (already running)"
echo "   3. Follow testing guide in docs/PHASE_7_8_TESTING_GUIDE.md"
echo ""
echo "🧪 Quick Test:"
echo "   1. Open http://localhost:5174"
echo "   2. Sign in with Auth0"
echo "   3. Start a 15-minute focus session"
echo "   4. Type steadily at 100+ keys/min"
echo "   5. Stop session and view AI recommendation"
echo "   6. Click 'Session History' in nav bar"
echo ""
echo "✨ Phase 7 Features to Test:"
echo "   - AI mood recommendations (10+ min sessions)"
echo "   - Session pattern analysis (steady vs erratic)"
echo "   - Gemini API integration"
echo "   - Graceful fallback handling"
echo ""
echo "✨ Phase 8 Features to Test:"
echo "   - Real-time session stats (4 metrics)"
echo "   - Session history page with filtering"
echo "   - Data export (JSON download)"
echo "   - Delete all sessions"
echo "   - Pagination controls"
echo ""
echo "Happy testing! 🎉"
