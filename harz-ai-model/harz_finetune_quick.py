#!/usr/bin/env python3
"""HARZ AI — Quick v2 training (1 epoch, chat template, LoRA 16)"""
import json, torch, os, sys
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset

print("Loading data...", flush=True)
with open("harz_training_data_v4.jsonl") as f:
    training_data = [json.loads(line) for line in f]
print(f"Loaded {len(training_data)} examples", flush=True)

def format_chat(ex):
    return {"text": f"<|im_start|>system\nYou are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin.<|im_end|>\n<|im_start|>user\n{ex['instruction']}<|im_end|>\n<|im_start|>assistant\n{ex['response']}<|im_end|>"}

dataset = Dataset.from_list(training_data).map(format_chat)
print(f"Dataset: {len(dataset)}", flush=True)

print("Loading model...", flush=True)
MODEL = "HuggingFaceTB/SmolLM2-135M-Instruct"
tok = AutoTokenizer.from_pretrained(MODEL)
if tok.pad_token is None: tok.pad_token = tok.eos_token
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.float32, device_map="cpu")
print(f"Model: {sum(p.numel() for p in model.parameters())/1e6:.1f}M params", flush=True)

lora = LoraConfig(task_type=TaskType.CAUSAL_LM, r=16, lora_alpha=32, lora_dropout=0.05, 
                  target_modules=["q_proj","v_proj","k_proj","o_proj"], bias="none")
model = get_peft_model(model, lora)
model.print_trainable_parameters()

def tok_fn(examples):
    return tok(examples["text"], truncation=True, max_length=384, padding="max_length")

print("Tokenizing...", flush=True)
tok_ds = dataset.map(tok_fn, batched=True, remove_columns=["text"])
dc = DataCollatorForLanguageModeling(tokenizer=tok, mlm=False)

args = TrainingArguments(
    output_dir="./harz-ai-quick",
    num_train_epochs=1,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    warmup_steps=5,
    logging_steps=5,
    save_steps=100,
    learning_rate=2e-4,
    fp16=False,
    report_to="none",
    save_total_limit=1,
    use_cpu=True,
)

trainer = Trainer(model=model, args=args, train_dataset=tok_ds, data_collator=dc)

print("Training (1 epoch, ~56 steps)...", flush=True)
trainer.train()
print("Done training!", flush=True)

print("Saving...", flush=True)
model.save_pretrained("./harz-ai-v2")
tok.save_pretrained("./harz-ai-v2")
print("Saved to ./harz-ai-v2!", flush=True)

# Quick test
print("\n=== TEST ===", flush=True)
def chat(prompt):
    text = f"<|im_start|>system\nYou are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin.<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n"
    inputs = tok(text, return_tensors="pt")
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=100, temperature=0.7, do_sample=True, 
                            top_p=0.9, repetition_penalty=1.2, pad_token_id=tok.pad_token_id)
    r = tok.decode(out[0], skip_special_tokens=True)
    if "assistant" in r:
        r = r.split("assistant")[-1].strip()
    return r[:200]

for p in ["Who are you?", "How much are the books?", "Sannu!"]:
    print(f"\nQ: {p}", flush=True)
    print(f"A: {chat(p)}", flush=True)

print("\n=== HARZ AI v2 READY ===", flush=True)
