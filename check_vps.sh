#!/bin/bash
# ===========================================
# DataM VPS Diagnostic Script
# Run this on your VPS: bash check_vps.sh
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="dasscmchp.com"
VPS_IP="46.224.171.105"
PROJECT_DIR="/var/www/data_mgmt"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"

PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}[PASS]${NC} $1"; ((PASS++)); }
fail() { echo -e "  ${RED}[FAIL]${NC} $1"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}[WARN]${NC} $1"; ((WARN++)); }
info() { echo -e "  [INFO] $1"; }
section() { echo -e "\n${YELLOW}=== $1 ===${NC}"; }

echo "==========================================="
echo "  DataM VPS Diagnostic Script"
echo "  Domain: $DOMAIN"
echo "  VPS IP: $VPS_IP"
echo "==========================================="

# -------------------------------------------
section "1. SYSTEM BASICS"
# -------------------------------------------

# Check OS
if [ -f /etc/os-release ]; then
    OS=$(grep PRETTY_NAME /etc/os-release | cut -d'"' -f2)
    info "OS: $OS"
else
    warn "Cannot detect OS"
fi

# Check Python
if command -v python3 &>/dev/null; then
    PYVER=$(python3 --version 2>&1)
    pass "Python installed: $PYVER"
else
    fail "Python3 is not installed"
fi

# Check Node
if command -v node &>/dev/null; then
    NODEVER=$(node --version 2>&1)
    if [[ "$NODEVER" == v1[89].* ]] || [[ "$NODEVER" == v2[0-9].* ]]; then
        pass "Node.js installed: $NODEVER"
    else
        fail "Node.js version too old: $NODEVER (need v18+)"
    fi
else
    fail "Node.js is not installed"
fi

# Check npm
if command -v npm &>/dev/null; then
    NPMVER=$(npm --version 2>&1)
    pass "npm installed: $NPMVER"
else
    fail "npm is not installed"
fi

# -------------------------------------------
section "2. PROJECT FILES"
# -------------------------------------------

# Check project directory
if [ -d "$PROJECT_DIR" ]; then
    pass "Project directory exists: $PROJECT_DIR"
else
    fail "Project directory not found: $PROJECT_DIR"
fi

# Check backend
if [ -f "$BACKEND_DIR/manage.py" ]; then
    pass "Backend manage.py found"
else
    fail "Backend manage.py not found at $BACKEND_DIR/manage.py"
fi

# Check frontend
if [ -f "$FRONTEND_DIR/package.json" ]; then
    pass "Frontend package.json found"
else
    fail "Frontend package.json not found"
fi

# Check frontend build
if [ -d "$FRONTEND_DIR/dist" ] && [ -f "$FRONTEND_DIR/dist/index.html" ]; then
    pass "Frontend build (dist/) exists"
else
    fail "Frontend not built - run: cd $FRONTEND_DIR && VITE_API_URL=http://$VPS_IP/api/v1 npm run build"
fi

# Check venv
if [ -f "$VENV_DIR/bin/activate" ]; then
    pass "Virtual environment found"
else
    fail "Virtual environment not found at $VENV_DIR"
fi

# Check .env
if [ -f "$BACKEND_DIR/.env" ]; then
    pass "Backend .env file exists"
    info ".env contents (secrets hidden):"
    while IFS= read -r line; do
        if [[ "$line" == "" ]] || [[ "$line" == \#* ]]; then
            continue
        fi
        KEY=$(echo "$line" | cut -d'=' -f1)
        VALUE=$(echo "$line" | cut -d'=' -f2-)
        if [[ "$KEY" == *"SECRET"* ]] || [[ "$KEY" == *"PASSWORD"* ]] || [[ "$KEY" == *"DATABASE_URL"* ]]; then
            info "  $KEY=*****(hidden)"
        else
            info "  $KEY=$VALUE"
        fi
    done < "$BACKEND_DIR/.env"
else
    fail "Backend .env file not found at $BACKEND_DIR/.env"
fi

# -------------------------------------------
section "3. DJANGO CHECK"
# -------------------------------------------

if [ -f "$VENV_DIR/bin/activate" ]; then
    source "$VENV_DIR/bin/activate"
    cd "$BACKEND_DIR"

    # Check Django
    DJANGO_CHECK=$(python3 manage.py check 2>&1)
    if echo "$DJANGO_CHECK" | grep -q "System check identified no issues"; then
        pass "Django system check passed"
    else
        fail "Django system check failed:"
        echo "$DJANGO_CHECK" | head -20
    fi

    # Check migrations
    MIGRATION_CHECK=$(python3 manage.py showmigrations 2>&1 | grep "\[ \]" | head -5)
    if [ -z "$MIGRATION_CHECK" ]; then
        pass "All migrations applied"
    else
        warn "Unapplied migrations found:"
        echo "$MIGRATION_CHECK"
    fi

    # Check static files
    if [ -d "$BACKEND_DIR/staticfiles" ]; then
        STATIC_COUNT=$(find "$BACKEND_DIR/staticfiles" -type f | wc -l)
        pass "Static files collected ($STATIC_COUNT files)"
    else
        warn "Static files not collected - run: python manage.py collectstatic"
    fi

    deactivate
fi

# -------------------------------------------
section "4. POSTGRESQL"
# -------------------------------------------

if command -v psql &>/dev/null; then
    pass "PostgreSQL client installed"

    # Check if PostgreSQL service is running
    if systemctl is-active --quiet postgresql; then
        pass "PostgreSQL service is running"
    else
        fail "PostgreSQL service is NOT running - run: sudo systemctl start postgresql"
    fi

    # Check if database exists
    if [ -f "$BACKEND_DIR/.env" ]; then
        DB_URL=$(grep "DATABASE_URL" "$BACKEND_DIR/.env" | cut -d'=' -f2-)
        if [ -n "$DB_URL" ]; then
            # Extract DB name from URL
            DB_NAME=$(echo "$DB_URL" | sed 's/.*\///' | cut -d'?' -f1)
            DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)
            if [ "$DB_EXISTS" = "1" ]; then
                pass "Database '$DB_NAME' exists"
            else
                fail "Database '$DB_NAME' does not exist"
            fi
        else
            warn "DATABASE_URL not found in .env - using SQLite"
        fi
    fi
else
    warn "PostgreSQL not installed - using SQLite"
fi

# -------------------------------------------
section "5. GUNICORN SERVICE"
# -------------------------------------------

if [ -f "/etc/systemd/system/datam.service" ]; then
    pass "Systemd service file exists"

    # Show service config
    info "Service configuration:"
    grep -E "^(ExecStart|WorkingDirectory|Environment|User)" /etc/systemd/system/datam.service | while read -r line; do
        if [[ "$line" == *"SECRET"* ]] || [[ "$line" == *"PASSWORD"* ]] || [[ "$line" == *"DATABASE_URL"* ]]; then
            KEY=$(echo "$line" | cut -d'=' -f1-2)
            info "  $KEY=*****(hidden)"
        else
            info "  $line"
        fi
    done

    if systemctl is-active --quiet datam; then
        pass "Gunicorn service is RUNNING"
    else
        fail "Gunicorn service is NOT running"
        info "Last logs:"
        journalctl -u datam -n 10 --no-pager 2>/dev/null
    fi

    # Check if Gunicorn is listening
    if ss -tlnp | grep -q ":8000"; then
        pass "Gunicorn is listening on port 8000"
    else
        fail "Nothing is listening on port 8000"
    fi
else
    fail "Systemd service file not found at /etc/systemd/system/datam.service"
fi

# -------------------------------------------
section "6. NGINX"
# -------------------------------------------

if command -v nginx &>/dev/null; then
    pass "Nginx installed"
else
    fail "Nginx is NOT installed"
fi

if systemctl is-active --quiet nginx; then
    pass "Nginx service is RUNNING"
else
    fail "Nginx service is NOT running"
fi

if ss -tlnp | grep -q ":80"; then
    pass "Nginx is listening on port 80"
else
    fail "Nothing is listening on port 80"
fi

# Check Nginx config
if [ -f "/etc/nginx/sites-available/datam" ]; then
    pass "Nginx site config exists"

    # Check server_name
    SERVER_NAME=$(grep "server_name" /etc/nginx/sites-available/datam)
    info "Server name: $SERVER_NAME"

    if echo "$SERVER_NAME" | grep -q "$VPS_IP"; then
        pass "VPS IP is in server_name"
    else
        fail "VPS IP ($VPS_IP) is NOT in server_name"
    fi

    if echo "$SERVER_NAME" | grep -q "$DOMAIN"; then
        pass "Domain is in server_name"
    else
        warn "Domain ($DOMAIN) is NOT in server_name"
    fi

    # Check root
    ROOT_DIR=$(grep "root " /etc/nginx/sites-available/datam | head -1 | awk '{print $2}' | tr -d ';')
    if [ -n "$ROOT_DIR" ] && [ -d "$ROOT_DIR" ]; then
        pass "Nginx root directory exists: $ROOT_DIR"
    elif [ -n "$ROOT_DIR" ]; then
        fail "Nginx root directory does NOT exist: $ROOT_DIR"
    fi

    # Check symlink
    if [ -L "/etc/nginx/sites-enabled/datam" ]; then
        LINK_TARGET=$(readlink /etc/nginx/sites-enabled/datam)
        if [ "$LINK_TARGET" = "/etc/nginx/sites-available/datam" ]; then
            pass "Nginx symlink is correct"
        else
            fail "Nginx symlink points to wrong target: $LINK_TARGET"
        fi
    else
        fail "Nginx symlink not found in sites-enabled"
    fi

    # Test config
    NGINX_TEST=$(nginx -t 2>&1)
    if echo "$NGINX_TEST" | grep -q "successful"; then
        pass "Nginx config test passed"
    else
        fail "Nginx config test failed:"
        echo "$NGINX_TEST"
    fi
else
    fail "Nginx site config not found at /etc/nginx/sites-available/datam"
fi

# Check for default site (can cause conflicts)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    warn "Default Nginx site is still enabled - may cause conflicts"
    info "  Fix: sudo rm /etc/nginx/sites-enabled/default && sudo systemctl restart nginx"
fi

# -------------------------------------------
section "7. FIREWALL"
# -------------------------------------------

UFW_STATUS=$(ufw status 2>/dev/null)
if echo "$UFW_STATUS" | grep -q "inactive"; then
    info "Firewall (UFW) is inactive - all ports are open"
else
    info "Firewall (UFW) is active"
    if echo "$UFW_STATUS" | grep -q "80"; then
        pass "Port 80 is allowed"
    else
        fail "Port 80 is NOT allowed - run: sudo ufw allow 80"
    fi
    if echo "$UFW_STATUS" | grep -q "443"; then
        pass "Port 443 is allowed"
    else
        warn "Port 443 is NOT allowed (needed for HTTPS) - run: sudo ufw allow 443"
    fi
fi

# -------------------------------------------
section "8. DNS"
# -------------------------------------------

# Check DNS resolution
DNS_RESULT=$(dig +short "$DOMAIN" @8.8.8.8 2>/dev/null)
if [ "$DNS_RESULT" = "$VPS_IP" ]; then
    pass "DNS resolves correctly: $DOMAIN -> $DNS_RESULT"
elif [ -n "$DNS_RESULT" ]; then
    fail "DNS resolves to wrong IP: $DOMAIN -> $DNS_RESULT (expected $VPS_IP)"
else
    fail "DNS does NOT resolve for $DOMAIN"
    info "This is a DNS/registrar issue, not a VPS issue"
    info "Fix: Use Cloudflare DNS or contact Yegara support"

    # Check nameservers
    NS_RESULT=$(dig +short NS "$DOMAIN" @8.8.8.8 2>/dev/null)
    if [ -n "$NS_RESULT" ]; then
        info "Current nameservers: $NS_RESULT"
    else
        info "No nameservers found - domain DNS is not configured"
    fi
fi

# -------------------------------------------
section "9. SSL/HTTPS"
# -------------------------------------------

if command -v certbot &>/dev/null; then
    pass "Certbot installed"
else
    warn "Certbot not installed - no SSL yet"
    info "Install: sudo apt install certbot python3-certbot-nginx"
fi

if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    pass "SSL certificate exists for $DOMAIN"

    # Check expiry
    EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRY" ]; then
        info "Certificate expires: $EXPIRY"
    fi
else
    warn "No SSL certificate for $DOMAIN"
    info "After DNS is working, run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# Check if Nginx has SSL config
if grep -q "443" /etc/nginx/sites-available/datam 2>/dev/null; then
    pass "Nginx is configured for HTTPS (port 443)"
else
    info "Nginx not yet configured for HTTPS"
fi

# -------------------------------------------
section "10. CONNECTIVITY TEST"
# -------------------------------------------

# Test backend via localhost
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/api/v1/health/ 2>/dev/null)
if [ "$HEALTH_CHECK" = "200" ]; then
    pass "Backend API responds (HTTP $HEALTH_CHECK)"
else
    fail "Backend API not responding (HTTP $HEALTH_CHECK)"
fi

# Test via Nginx
NGINX_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/v1/health/ 2>/dev/null)
if [ "$NGINX_CHECK" = "200" ]; then
    pass "Nginx proxy to backend works (HTTP $NGINX_CHECK)"
else
    fail "Nginx proxy not working (HTTP $NGINX_CHECK)"
fi

# Test frontend via Nginx
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ 2>/dev/null)
if [ "$FRONTEND_CHECK" = "200" ]; then
    pass "Frontend loads via Nginx (HTTP $FRONTEND_CHECK)"
else
    fail "Frontend not loading via Nginx (HTTP $FRONTEND_CHECK)"
fi

# Test via public IP
PUBLIC_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://$VPS_IP/api/v1/health/ 2>/dev/null)
if [ "$PUBLIC_CHECK" = "200" ]; then
    pass "Public access via IP works (HTTP $PUBLIC_CHECK)"
else
    fail "Public access via IP not working (HTTP $PUBLIC_CHECK)"
fi

# -------------------------------------------
section "SUMMARY"
# -------------------------------------------

echo ""
echo "==========================================="
echo -e "  ${GREEN}PASSED: $PASS${NC}"
echo -e "  ${RED}FAILED: $FAIL${NC}"
echo -e "  ${YELLOW}WARNINGS: $WARN${NC}"
echo "==========================================="

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}Everything looks good!${NC}"
    echo "Your app should be accessible at:"
    echo "  http://$VPS_IP"
    if [ -n "$DNS_RESULT" ] && [ "$DNS_RESULT" = "$VPS_IP" ]; then
        echo "  http://$DOMAIN"
    else
        echo "  http://$DOMAIN (waiting for DNS)"
    fi
else
    echo -e "\n${RED}There are $FAIL issue(s) to fix.${NC}"
    echo "Fix the FAIL items above, then run this script again."
fi

echo ""
