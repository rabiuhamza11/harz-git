#!/usr/bin/env python3
"""Test HARZ AI fine-tuned model"""
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

HARZ_SYSTEM = "You are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin."

print("Loading base model + LoRA adapter...")
MODEL_NAME = "HuggingFaceTB/SmolLM2-135M-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float32, device_map="cpu")
model = PeftModel.from_pretrained(model, "./harz-ai-final")
model.eval()
print("Model loaded!\n")

def chat(prompt):
    full = HARZ_SYSTEM + "\n" + prompt + "\n"
    inputs = tokenizer(full, return_tensors="pt")
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=100,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.pad_token_id
        )
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    # Extract just the response part
    if prompt in response:
        response = response[len(full):].strip()
    return response[:300]

print("=" * 50)
print("HARZ AI — FINE-TUNED MODEL TEST")
print("=" * 50)

tests = [
    "Who are you?",
    "Sannu!",
    "How much are the books?",
    "What payment methods do you accept?",
    "What is HARZ Digital Services?",
    "Wane ne kai?",
    "Tell me about Python programming",
    "How can I start a business in Nigeria?",
    "What is GDEG token?",
    "Write a marketing post about HARZ",
]

for i, prompt in enumerate(tests, 1):
    print(f"\n--- Test {i} ---")
    print(f"Q: {prompt}")
    response = chat(prompt)
    print(f"A: {response}")
    print()

print("=" * 50)
print("HARZ AI is ready!")
print("=" * 50)
