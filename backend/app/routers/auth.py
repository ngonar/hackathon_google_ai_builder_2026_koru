import os
import json
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Response
from app.core.config import settings
from app.models.user import UserRegisterRequest, UserLoginRequest, UserProfile
from app.services.memory_vault import memory_vault

router = APIRouter(prefix="/api/auth", tags=["Authentication & Guardians"])

USERS_FILE = os.path.join(settings.DATA_DIR, "users.json")

def _load_users() -> list:
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading users: {e}")
        return []

def _save_users(users: list):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving users: {e}")

@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, response: Response):
    users = _load_users()
    
    # Check if email already registered
    for u in users:
        if u.get("email", "").lower() == req.email.strip().lower():
            response.set_cookie(key="koru_auth", value="true", max_age=2592000, path="/")
            return UserProfile(
                id=u["id"],
                full_name=u["full_name"],
                email=u["email"],
                relation=u.get("relation", req.relation),
                memorial_honoree=u.get("memorial_honoree", req.memorial_honoree),
                memorial_focus=u.get("memorial_focus", req.memorial_focus),
                sanctuary_privacy=u.get("sanctuary_privacy", req.sanctuary_privacy),
                preferred_tone=u.get("preferred_tone", req.preferred_tone),
                reverence_pledge=u.get("reverence_pledge", True),
                avatar_initial=u["full_name"][0].upper() if u.get("full_name") else "K",
                created_at=u.get("created_at", datetime.utcnow().isoformat())
            )

    avatar_initial = req.full_name.strip()[0].upper() if req.full_name.strip() else "K"
    user_id = f"user-{uuid.uuid4().hex[:8]}"
    
    new_user = {
        "id": user_id,
        "full_name": req.full_name.strip(),
        "email": req.email.strip().lower(),
        "password_hash": f"hash_{req.password[:4]}_{len(req.password)}",
        "relation": req.relation,
        "memorial_honoree": req.memorial_honoree or "Margaret 'Peggy' Sutherland",
        "memorial_focus": req.memorial_focus or "Living Avatar & Neural Voice",
        "sanctuary_privacy": req.sanctuary_privacy or "family_only",
        "preferred_tone": req.preferred_tone or "Warm & Contemplative",
        "reverence_pledge": req.reverence_pledge,
        "avatar_initial": avatar_initial,
        "created_at": datetime.utcnow().isoformat()
    }
    
    users.append(new_user)
    _save_users(users)
    
    # Update default memorial user relationship if appropriate
    peggy = memory_vault.get_memorial("peggy-sutherland-1946")
    if peggy:
        peggy.user_name = req.full_name.strip().split()[0]
        peggy.user_relation = req.relation
        memory_vault.save_memorial(peggy)

    response.set_cookie(key="koru_auth", value="true", max_age=2592000, path="/")
    return UserProfile(
        id=new_user["id"],
        full_name=new_user["full_name"],
        email=new_user["email"],
        relation=new_user["relation"],
        memorial_honoree=new_user["memorial_honoree"],
        memorial_focus=new_user["memorial_focus"],
        sanctuary_privacy=new_user["sanctuary_privacy"],
        preferred_tone=new_user["preferred_tone"],
        reverence_pledge=new_user["reverence_pledge"],
        avatar_initial=new_user["avatar_initial"],
        created_at=new_user["created_at"]
    )

@router.post("/login", response_model=UserProfile)
def login_user(req: UserLoginRequest, response: Response):
    users = _load_users()
    for u in users:
        if u.get("email", "").lower() == req.email.strip().lower():
            response.set_cookie(key="koru_auth", value="true", max_age=2592000, path="/")
            return UserProfile(
                id=u["id"],
                full_name=u["full_name"],
                email=u["email"],
                relation=u.get("relation", "Family"),
                memorial_honoree=u.get("memorial_honoree", "Margaret 'Peggy' Sutherland"),
                memorial_focus=u.get("memorial_focus", "Living Avatar & Neural Voice"),
                sanctuary_privacy=u.get("sanctuary_privacy", "family_only"),
                preferred_tone=u.get("preferred_tone", "Warm & Contemplative"),
                reverence_pledge=u.get("reverence_pledge", True),
                avatar_initial=u["full_name"][0].upper() if u.get("full_name") else "K",
                created_at=u.get("created_at", datetime.utcnow().isoformat())
            )
            
    # If not found, return demo user
    if users:
        u = users[0]
        response.set_cookie(key="koru_auth", value="true", max_age=2592000, path="/")
        return UserProfile(
            id=u["id"],
            full_name=u["full_name"],
            email=u["email"],
            relation=u.get("relation", "Granddaughter"),
            memorial_honoree=u.get("memorial_honoree", "Margaret 'Peggy' Sutherland"),
            memorial_focus=u.get("memorial_focus", "Living Avatar & Neural Voice"),
            sanctuary_privacy=u.get("sanctuary_privacy", "family_only"),
            preferred_tone=u.get("preferred_tone", "Warm & Contemplative"),
            reverence_pledge=u.get("reverence_pledge", True),
            avatar_initial=u.get("avatar_initial", "C"),
            created_at=u.get("created_at", datetime.utcnow().isoformat())
        )
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid sanctuary credentials")

@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie(key="koru_auth", path="/")
    return {"message": "Logged out from sanctuary"}

@router.get("/me", response_model=UserProfile)
def get_current_guardian():
    users = _load_users()
    if users:
        u = users[-1]  # Return most recently registered or primary guardian
        return UserProfile(
            id=u["id"],
            full_name=u["full_name"],
            email=u["email"],
            relation=u.get("relation", "Granddaughter"),
            memorial_honoree=u.get("memorial_honoree", "Margaret 'Peggy' Sutherland"),
            memorial_focus=u.get("memorial_focus", "Living Avatar & Neural Voice"),
            sanctuary_privacy=u.get("sanctuary_privacy", "family_only"),
            preferred_tone=u.get("preferred_tone", "Warm & Contemplative"),
            reverence_pledge=u.get("reverence_pledge", True),
            avatar_initial=u.get("avatar_initial", "C"),
            created_at=u.get("created_at", datetime.utcnow().isoformat())
        )
    return UserProfile(
        id="demo-guardian",
        full_name="Clara Sutherland",
        email="clara.sutherland@sanctuary.koru",
        relation="Granddaughter",
        memorial_honoree="Margaret 'Peggy' Sutherland",
        memorial_focus="Living Avatar & Neural Voice",
        sanctuary_privacy="family_only",
        preferred_tone="Warm & Contemplative",
        reverence_pledge=True,
        avatar_initial="C",
        created_at=datetime.utcnow().isoformat()
    )

@router.get("/guardians", response_model=List[UserProfile])
def list_guardians():
    users = _load_users()
    res = []
    for u in users:
        res.append(UserProfile(
            id=u["id"],
            full_name=u["full_name"],
            email=u["email"],
            relation=u.get("relation", "Family"),
            memorial_honoree=u.get("memorial_honoree", "Margaret 'Peggy' Sutherland"),
            memorial_focus=u.get("memorial_focus", "Living Avatar & Neural Voice"),
            sanctuary_privacy=u.get("sanctuary_privacy", "family_only"),
            preferred_tone=u.get("preferred_tone", "Warm & Contemplative"),
            reverence_pledge=u.get("reverence_pledge", True),
            avatar_initial=u.get("avatar_initial", u["full_name"][0].upper() if u.get("full_name") else "K"),
            created_at=u.get("created_at", datetime.utcnow().isoformat())
        ))
    return res
