# Deployment — `/opt/robot/pidsim`

Target: Linux server, nginx, service user/group **matamoe:matamoe**. HTTP only
for now (SSL + domain later).

## Layout

```
/opt/robot/pidsim/            git checkout (repo root)
├─ backend/.venv/             python venv (gunicorn + uvicorn workers)
├─ frontend/dist/             built SPA (served by nginx)
└─ data/                      admin-uploaded robots/ and tracks/ (gitignored)
```

## First-time install

```bash
sudo mkdir -p /opt/robot && sudo chown matamoe:matamoe /opt/robot
sudo -u matamoe git clone git@github.com:matamoehub/PIDSimulator.git /opt/robot/pidsim
cd /opt/robot/pidsim

# Backend
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt

# Frontend
( cd frontend && npm ci && npm run build )

# Service
sudo cp deploy/pidsim-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now pidsim-api

# nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/pidsim
sudo ln -s /etc/nginx/sites-available/pidsim /etc/nginx/sites-enabled/pidsim
sudo nginx -t && sudo systemctl reload nginx
```

## Sudoers (for the admin Restart fallback)

The admin **Deploy** uses a graceful SIGHUP reload (no sudo). A hard restart is
only needed rarely; grant the service user a narrow, password-less rule:

```
# /etc/sudoers.d/pidsim   (sudo visudo -f /etc/sudoers.d/pidsim)
matamoe ALL=(root) NOPASSWD: /bin/systemctl reload pidsim-api.service, /bin/systemctl restart pidsim-api.service, /bin/systemctl is-active pidsim-api.service, /bin/journalctl -u pidsim-api.service *
```

## Updating

- From the web: **Admin → Deploy** (pull · install · build · test · reload).
- From a shell: `/opt/robot/pidsim/deploy/update_site.sh`

Both run the full test suite and abort the deploy if anything fails.

## Security note

`/admin` and `/api/admin/*` are **unauthenticated**. Before this host is
reachable off the LAN, restrict them — uncomment the `allow`/`deny` block in
`nginx.conf`, and/or add SSL + auth.
