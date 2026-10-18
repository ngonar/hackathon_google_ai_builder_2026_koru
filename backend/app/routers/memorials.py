from fastapi import APIRouter, HTTPException
from typing import List
from app.models.memorial import Memorial, AcousticCalibrationUpdate
from app.services.memory_vault import memory_vault

router = APIRouter(prefix="/api/memorials", tags=["Memorials"])

@router.get("", response_model=List[Memorial])
def list_memorials():
    return memory_vault.get_all_memorials()

@router.get("/{memorial_id}", response_model=Memorial)
def get_memorial(memorial_id: str):
    m = memory_vault.get_memorial(memorial_id)
    if not m:
        raise HTTPException(status_code=404, detail="Memorial not found")
    return m

@router.post("", response_model=Memorial)
def create_memorial(memorial: Memorial):
    memory_vault.save_memorial(memorial)
    return memorial

@router.patch("/{memorial_id}/calibration", response_model=Memorial)
def update_calibration(memorial_id: str, update: AcousticCalibrationUpdate):
    m = memory_vault.get_memorial(memorial_id)
    if not m:
        raise HTTPException(status_code=404, detail="Memorial not found")
        
    if update.warmth is not None:
        m.warmth_level = update.warmth
    if update.presence is not None:
        m.presence_level = update.presence
    if update.southern_lilt is not None:
        m.southern_lilt = update.southern_lilt
    if update.voice_name is not None:
        m.voice_name = update.voice_name
        
    memory_vault.save_memorial(m)
    return m
