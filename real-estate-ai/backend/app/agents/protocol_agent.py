import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

class Message:
    """Lightweight internal agent message envelope.

    This is a simplified Agent-to-Agent (A2A) protocol structure that could be
    extended or swapped for MCP or other standards later. For now we keep it
    framework-agnostic and in-memory.
    """
    def __init__(self, sender: str, recipient: str, msg_type: str, payload: Dict[str, Any]):
        self.id = str(uuid.uuid4())
        self.sender = sender
        self.recipient = recipient
        self.msg_type = msg_type  # e.g. REQUEST, RESPONSE, NOTIFY
        self.payload = payload
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "sender": self.sender,
            "recipient": self.recipient,
            "type": self.msg_type,
            "payload": self.payload,
            "created_at": self.created_at
        }

class AgentBus:
    """A minimal in-process message bus for agent communication.

    This is not persistent and not distributed; it's a demonstrator for
    agentic orchestration. Observability hooks could forward messages to a
    queue or log for audit.
    """
    def __init__(self):
        self._subscribers: Dict[str, List] = {}
        self._history: List[Dict[str, Any]] = []

    def subscribe(self, agent_name: str, handler):
        self._subscribers.setdefault(agent_name, []).append(handler)

    def publish(self, message: Message):
        self._history.append(message.to_dict())
        for handler in self._subscribers.get(message.recipient, []):
            try:
                handler(message)
            except Exception:
                # Best-effort; in production log/alert
                pass

    def history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self._history[-limit:]

# Singleton bus instance
agent_bus = AgentBus()
