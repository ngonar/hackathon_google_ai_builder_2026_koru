from fastapi import APIRouter, HTTPException
from typing import List
from app.models.memorial import MemoryItem, Tribute
from app.services.memory_vault import memory_vault

router = APIRouter(prefix="/api/memorials/{memorial_id}", tags=["Memories & Tributes"])

@router.get("/memories", response_model=List[MemoryItem])
def get_memories(memorial_id: str):
    return memory_vault.get_memories_for_memorial(memorial_id)

@router.post("/memories", response_model=MemoryItem)
def add_memory(memorial_id: str, memory: MemoryItem):
    memory.memorial_id = memorial_id
    # Calculate vector embedding
    embedding = memory_vault.embed_text(f"{memory.title}\n{memory.content}")
    if embedding:
        memory.embedding = embedding
    memory_vault.save_memories([memory])
    return memory

@router.get("/tributes", response_model=List[Tribute])
def get_tributes(memorial_id: str):
    return memory_vault.get_tributes_for_memorial(memorial_id)

@router.post("/tributes", response_model=Tribute)
def add_tribute(memorial_id: str, tribute: Tribute):
    tribute.memorial_id = memorial_id
    memory_vault.save_tributes([tribute])
    return tribute
