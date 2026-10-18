from fastapi import APIRouter, HTTPException
from typing import List
from app.models.memorial import CommunionRequest, CommunionResponse, ChatMessage
from app.services.google_agent import google_agent
from app.services.memory_vault import memory_vault

router = APIRouter(prefix="/api/communion", tags=["Communion"])

@router.post("", response_model=CommunionResponse)
def commune_with_avatar(req: CommunionRequest):
    try:
        # Record user message in chat log
        user_msg = ChatMessage(
            memorial_id=req.memorial_id,
            role="user",
            text=req.message
        )
        memory_vault.save_messages([user_msg])

        # Generate avatar response via Google Agent
        communion_res = google_agent.commune(
            memorial_id=req.memorial_id,
            user_message=req.message,
            user_name=req.user_name or "Clara",
            include_audio=req.include_audio,
            voice_name_override=req.voice_name
        )

        # Record avatar reply in chat log
        avatar_msg = ChatMessage(
            memorial_id=req.memorial_id,
            role="avatar",
            text=communion_res.reply_text,
            memory_citation=", ".join(communion_res.memory_citations) if communion_res.memory_citations else None,
            cadence_note=communion_res.cadence_info
        )
        memory_vault.save_messages([avatar_msg])

        return communion_res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{memorial_id}/messages", response_model=List[ChatMessage])
def get_chat_history(memorial_id: str):
    return memory_vault.get_messages_for_memorial(memorial_id)
