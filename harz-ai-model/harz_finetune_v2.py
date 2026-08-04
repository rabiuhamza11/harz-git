#!/usr/bin/env python3
"""
HARZ AI — Fine-tuning v2 with proper SmolLM2 chat template
Uses correct <|im_start|>/<|im_end|> format and trains for 3 epochs
"""
import json, torch, os
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset

print("Loading training data...")
with open("harz_training_data_v4.jsonl") as f:
    training_data = [json.loads(line) for line in f]
print(f"Loaded {len(training_data)} examples")

# Use SmolLM2's native chat template format
def format_chat(example):
    messages = [
        {"role": "system", "content": "You are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin."},
        {"role": "user", "content": example["instruction"]},
        {"role": "assistant", "content": example["response"]}
    ]
    text = (
        "<|im_start|>system\nYou are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin.<|im_end|>\n"
        f"<|im_start|>user\n{example['instruction']}<|im_end|>\n"
        f"<|im_start|>assistant\n{example['response']}<|im_end|>"
    )
    return {"text": text}

print("Formatting with chat template...")
dataset = Dataset.from_list(training_data).map(format_chat)
print(f"Dataset: {len(dataset)} examples")
print(f"\nSample (first 200 chars):\n{dataset[0]['text'][:200]}...")

print("\nLoading tokenizer & model (CPU)...")
MODEL_NAME = "HuggingFaceTB/SmolLM2-135M-Instruct"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float32, device_map="cpu")
print(f"Model: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M params")

# LoRA — rank 16 for better capacity
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512, padding="max_length")

print("Tokenizing...")
tokenized = dataset.map(tokenize_function, batched=True, remove_columns=["text"])
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

# 3 epochs, batch 2, accum 4 (effective batch 8)
training_args = TrainingArguments(
    output_dir="./harz-ai-v2",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=4,
    warmup_steps=10,
    logging_steps=10,
    save_steps=500,
    learning_rate=1e-4,
    fp16=False,
    report_to="none",
    save_total_limit=1,
    use_cpu=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
    data_collator=data_collator,
)

print(f"\nStarting training (3 epochs, ~{len(tokenized) * 3 / 8:.0f} steps)...")
trainer.train()
print("Training complete!")

print("\nSaving model...")
model.save_pretrained("./harz-ai-v2-final")
tokenizer.save_pretrained("./harz-ai-v2-final")
print("Saved to ./harz-ai-v2-final")

# Test
print("\n" + "=" * 60)
print("HARZ AI v2 — TESTING")
print("=" * 60)

def chat(prompt):
    text = (
        "<|im_start|>system\nYou are HARZ AI, a helpful assistant for HARZ Digital Services, a Nigerian digital business ecosystem. Be warm, direct, and concise. Support English, Hausa, and Pidgin.<|im_end|>\n"
        f"<|im_start|>user\n{prompt}<|im_end|>\n"
        "<|im_start|>assistant\n"
    )
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=120,
            temperature=0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.2,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.convert_tokens_to_ids("<|im_end|>"),
        )
    response = tokenizer.decode(output[0], skip_special_tokens=True)
    # Extract assistant response
    if "<|im_start|>assistant\n" in response:
        response = response.split("<|im_start|>assistant\n")[-1]
    if "<|im_end|>" in response:
        response = response.split("<|im_end|>")[0]
    return response.strip()

tests = [
    "Who are you?",
    "Sannu!",
    "How much are the books?",
    "What payment methods do you accept?",
    "Wane ne kai?",
    "How can I start a business in Nigeria?",
    "What is GDEG token?",
    "What products do you sell?",
]

for i, prompt in enumerate(tests, 1):
    print(f"\n--- Test {i} ---")
    print(f"Q: {prompt}")
    resp = chat(prompt)
    print(f"A: {resp}")

print("\n" + "=" * 60)
print("DONE — HARZ AI v2 is ready!")
print("=" * 60)
